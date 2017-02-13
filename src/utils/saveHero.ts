import * as ActivatableStore from '../stores/ActivatableStore';
import * as Categories from '../constants/Categories';
import * as WebAPIUtils from './WebAPIUtils';
import APStore from '../stores/APStore';
import AttributeStore from '../stores/AttributeStore';
import CombatTechniquesStore from '../stores/CombatTechniquesStore';
import CultureStore from '../stores/CultureStore';
import DisAdvStore from '../stores/DisAdvStore';
import ELStore from '../stores/ELStore';
import HistoryStore from '../stores/HistoryStore';
import LiturgiesStore from '../stores/LiturgiesStore';
import PhaseStore from '../stores/PhaseStore';
import ProfessionStore from '../stores/ProfessionStore';
import ProfessionVariantStore from '../stores/ProfessionVariantStore';
import ProfileStore from '../stores/ProfileStore';
import RaceStore from '../stores/RaceStore';
import SpecialAbilitiesStore from '../stores/SpecialAbilitiesStore';
import SpellsStore from '../stores/SpellsStore';
import TalentsStore from '../stores/TalentsStore';
import VersionStore from '../stores/VersionStore';

export const generateArray = (): SaveData => ({
	overview: {
		clientVersion: VersionStore.get(),
		dateCreated: (new Date()).toJSON(),
		dateModified: (new Date()).toJSON(),
		id: ProfileStore.getID(),
		phase: PhaseStore.get(),
		name: ProfileStore.getName(),
		avatar: ProfileStore.getAvatar(),
		ap: APStore.getAll(),
		el: ELStore.getStartID(),
		r: RaceStore.getCurrentID() as string,
		c: CultureStore.getCurrentID() as string,
		p: ProfessionStore.getCurrentId() as string,
		pv: ProfessionVariantStore.getCurrentID(),
		sex: ProfileStore.getSex()
	},
	details: {
		pers: ProfileStore.getAll(),
		attr: AttributeStore.getForSave(),
		activatable: ActivatableStore.getForSave(),
		disadv: {
			ratingVisible: DisAdvStore.getRating()
		},
		talents: TalentsStore.getForSave(),
		ct: CombatTechniquesStore.getAllForSave(),
		spells: SpellsStore.getForSave(),
		chants: LiturgiesStore.getForSave(),
		items: {},
		history: HistoryStore.getAll()
	}
});

export default () => WebAPIUtils.saveHero(generateArray());
