import { pipe } from 'ramda';
import { getActiveSelections } from './activatable/selectionUtils';
import { ActivatableDependent } from './activeEntries/ActivatableDependent';
import { ActivatableSkillDependent, ActivatableSkillDependentG } from './activeEntries/ActivatableSkillDependent';
import { AttributeDependent } from './activeEntries/AttributeDependent';
import { flattenDependencies } from './dependencies/flattenDependencies';
import { getNumericBlessedTraditionIdByInstanceId } from './IDUtils';
import { ifElse } from './ifElse';
import { inc } from './mathUtils';
import { getExceptionalSkillBonus, getInitialMaximumList, putMaximumSkillRatingFromExperienceLevel } from './skillUtils';
import { cnst, ident } from './structures/Function';
import { all, any, cons_, List, minimum, notElemF } from './structures/List';
import { elem, fmap, Just, Maybe, or } from './structures/Maybe';
import { OrderedMap } from './structures/OrderedMap';
import { Record } from './structures/Record';
import { isNumber } from './typeCheckUtils';
import { Blessing } from './wikiData/Blessing';
import { ExperienceLevel } from './wikiData/ExperienceLevel';
import { LiturgicalChant, LiturgicalChantG } from './wikiData/LiturgicalChant';
import { SpecialAbility } from './wikiData/SpecialAbility';

const { id, tradition, aspects } = LiturgicalChantG
const { value } = ActivatableSkillDependentG

export const isOwnTradition =
  (currentTradition: Record<SpecialAbility>) =>
  (obj: Record<LiturgicalChant> | Record<Blessing>): boolean => {
    const numeric_tradition_id =
      fmap (inc) (getNumericBlessedTraditionIdByInstanceId (id (currentTradition)))

    return any<number> (e => e === 1 || elem (e) (numeric_tradition_id)) (tradition (obj))
  }

const putAspectKnowledgeRestrictionMaximum =
  (currentTradition: Record<SpecialAbility>) =>
  (aspectKnowledge: Maybe<Record<ActivatableDependent>>) =>
  (wikiEntry: Record<LiturgicalChant>) =>
    ifElse<List<number>, List<number>>
      (cnst (
        // is not nameless tradition
        id (currentTradition) !== 'SA_693'
        // no aspect knowledge active for the current chant
        && or (fmap (all (notElemF<string | number> (aspects (wikiEntry))))
                    (getActiveSelections (aspectKnowledge)))
      ))
      (cons_ (14))
      (ident)

export const isIncreasable =
  (currentTradition: Record<SpecialAbility>) =>
  (wikiEntry: Record<LiturgicalChant>) =>
  (instance: Record<ActivatableSkillDependent>) =>
  (startEL: Record<ExperienceLevel>) =>
  (phase: number) =>
  (attributes: OrderedMap<string, Record<AttributeDependent>>) =>
  (exceptionalSkill: Maybe<Record<ActivatableDependent>>) =>
  (aspectKnowledge: Maybe<Record<ActivatableDependent>>): boolean => {
    const bonus = getExceptionalSkillBonus (id (wikiEntry)) (exceptionalSkill)

    const max = pipe (
                       getInitialMaximumList (attributes),
                       putMaximumSkillRatingFromExperienceLevel (startEL) (phase),
                       putAspectKnowledgeRestrictionMaximum (currentTradition)
                                                            (aspectKnowledge)
                                                            (wikiEntry),
                       minimum
                     )
                     (wikiEntry)

    return value (instance) < max + bonus
  }

export const getAspectCounter = (
  wiki: OrderedMap<string, Record<LiturgicalChant>>) =>
  (state: OrderedMap<string, Record<ActivatableSkillDependent>>
) =>
  state.filter (e => e.get ('value') >= 10)
    .foldl<OrderedMap<number, number>> (
      acc => instance =>
        Maybe.maybe<Record<LiturgicalChant>, OrderedMap<number, number>> (acc) (
          wikiEntry => wikiEntry.get ('aspects')
            .foldl<OrderedMap<number, number>> (
              acc1 => acc1.alter (
                R.pipe (
                  Maybe.fromMaybe (0),
                  R.inc,
                  Just
                )
              )
            ) (acc)
        ) (wiki.lookup (instance.get ('id')))
    ) (OrderedMap.empty ())

export const isDecreasable = (
  wiki: Record<WikiAll>) =>
  (state: Record<HeroDependent>) =>
  (wikiEntry: Record<LiturgicalChant>) =>
  (instance: Record<ActivatableSkillDependent>) =>
  (liturgicalChants: OrderedMap<string, Record<ActivatableSkillDependent>>) =>
  (aspectKnowledge: Maybe<Record<ActivatableDependent>>
): boolean => {
  const dependencies = flattenDependencies<number | boolean> (
    wiki,
    state,
    instance.get ('dependencies')
  )

  // Basic validation
  const valid = instance.get ('value') < 1
    ? dependencies.notElem (true)
    : instance.get ('value') > dependencies .filter (isNumber) .cons (0) .maximum ()

  return Maybe.fromMaybe (valid) (
    getActiveSelections (aspectKnowledge)
      // Check if liturgical chant is part of dependencies of active Aspect Knowledge
      .bind (Maybe.ensure (
        activeAspects => activeAspects.any (
          e => isNumber (e) && wikiEntry.get ('aspects').elem (e)
        )
      ))
      .fmap (
        activeAspects => {
          const counter = getAspectCounter (wiki.get ('liturgicalChants'), liturgicalChants)

          const countedLowestWithProperty = wikiEntry.get ('aspects').foldl<number> (
            n => aspect => {
              const counted = counter.lookup (aspect)

              if (Maybe.isJust (counted) && activeAspects.elem (aspect)) {
                return Math.min (Maybe.fromJust (counted), n)
              }

              return n
            }
          ) (4)

          return (instance.get ('value') !== 10 || countedLowestWithProperty > 3) && valid
        }
      )
  )
}

// Keys are aspects and their value is the respective tradition
const traditionsByAspect = OrderedMap.of ([
  [1, 1],
  [2, 2],
  [3, 2],
  [4, 3],
  [5, 3],
  [6, 4],
  [7, 4],
  [8, 5],
  [9, 5],
  [10, 6],
  [11, 6],
  [12, 7],
  [13, 7],
  [14, 8],
  [15, 8],
  [16, 9],
  [17, 9],
  [18, 10],
  [19, 10],
  [20, 11],
  [21, 11],
  [22, 12],
  [23, 12],
  [24, 13],
  [25, 13],
  [26, 15],
  [27, 15],
  [28, 16],
  [29, 16],
  [30, 17],
  [31, 17],
  [32, 18],
  [33, 18],
  [34, 19],
  [35, 19],
])

/**
 * Returns the tradition id used by chants. To get the tradition SId for the
 * actual special ability, you have to decrease the return value by 1.
 * @param aspectId The id used for chants or Aspect Knowledge.
 */
export const getTraditionOfAspect = traditionsByAspect.findWithDefault (1)

// Keys are traditions and their values are their respective aspects
const aspectsByTradition = OrderedMap.of<number, List<number>> ([
  [1, List.of ()],
  [2, List.of (2, 3)],
  [3, List.of (4, 5)],
  [4, List.of (6, 7)],
  [5, List.of (8, 9)],
  [6, List.of (10, 11)],
  [7, List.of (12, 13)],
  [8, List.of (14, 15)],
  [9, List.of (16, 17)],
  [10, List.of (18, 19)],
  [11, List.of (20, 21)],
  [12, List.of (22, 23)],
  [13, List.of (24, 25)],
  [14, List.of ()],
  [15, List.of (26, 27)],
  [16, List.of (28, 29)],
  [17, List.of (30, 31)],
  [18, List.of (32, 33)],
  [19, List.of (34, 35)],
])

/**
 * Return the aspect ids used for chants and Aspect Knowledge.
 * @param traditionId The id used by chants. If you only have the SId from the
 * actual special ability, you have to increase the value by 1 before passing
 * it.
 */
export const getAspectsOfTradition = R.pipe (
  aspectsByTradition.findWithDefault (List.of<number> ()),
  flip<List<number>, number, List<number>> (List.cons) (1)
)
