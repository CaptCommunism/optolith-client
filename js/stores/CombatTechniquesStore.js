import AppDispatcher from '../dispatcher/AppDispatcher';
import { EventEmitter } from 'events';
import ELStore from './ELStore';
import ListStore from './ListStore';
import PhaseStore from './PhaseStore';
import ActionTypes from '../constants/ActionTypes';
import Categories from '../constants/Categories';

const CATEGORY = Categories.COMBAT_TECHNIQUES;

var _filter = '';
var _sortOrder = 'name';

function _updateFilterText(text) {
	_filter = text;
}

function _updateSortOrder(option) {
	_sortOrder = option;
}
	
var CombatTechniquesStore = Object.assign({}, EventEmitter.prototype, {
	
	emitChange: function() {
		this.emit('change');
	},

	addChangeListener: function(callback) {
		this.on('change', callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener('change', callback);
	},

	getForSave: function() {
		var all = ListStore.getAllByCategory(CATEGORY);
		var result = new Map();
		all.forEach(e => {
			let { id, fw } = e;
			if (fw > 6) {
				result.set(id, fw);
			}
		});
		return {
			active: Array.from(result)
		};
	},

	get: function(id) {
		return ListStore.get(id);
	},

	getLeitMod: function(array) {
		var max = array.map(attr => this.get(attr).value).reduce((a, b) => Math.max(a, b), 0);
		return Math.max(Math.floor((max - 8) / 3), 0);
	},

	getAllForView: function() {
		var phase = PhaseStore.get();

		var combatTechniquesObj = ListStore.getObjByCategory(CATEGORY);
		var combatTechniques = [];

		var SA_19 = this.get('SA_19').active;
		var SA_19_REQ = SA_19 && ListStore.getAllByCategoryGroup(CATEGORY, 2).filter(e => e.value >= 10).length === 1;

		for (let id in combatTechniquesObj) {
			let combatTechnique = combatTechniquesObj[id];
			let { fw, leit, gr, dependencies } = combatTechnique;

			let _max = 25;
			let _max_bonus = this.get('ADV_17').active.indexOf(id) > -1 ? 1 : 0;
			if (phase < 3)
				_max = ELStore.getStart().max_combattech + _max_bonus;
			else {
				let primary = leit.map(e => ListStore.get(e).value);
				_max = Math.max(...primary) + 2 + _max_bonus;
			}
			combatTechnique.disabledIncrease = fw >= _max;

			combatTechnique.disabledDecrease = (SA_19_REQ && fw >= 10 && gr === 2) || fw <= Math.max(6, ...dependencies);

			combatTechniques.push(combatTechnique);
		}
		if (_filter !== '') {
			let filter = _filter.toLowerCase();
			combatTechniques = combatTechniques.filter(obj => obj.name.toLowerCase().match(filter));
		}
		if (_sortOrder == 'name') {
			combatTechniques.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				} else if (a.name > b.name) {
					return 1;
				} else {
					return 0;
				}
			});
		} else if (_sortOrder == 'groups') {
			combatTechniques.sort((a, b) => {
				if (a.gr < b.gr) {
					return -1;
				} else if (a.gr > b.gr) {
					return 1;
				} else {
					if (a.name < b.name) {
						return -1;
					} else if (a.name > b.name) {
						return 1;
					} else {
						return 0;
					}
				}
			});
		}
		for (let i = 0; i < combatTechniques.length; i++) {
			if (combatTechniques[i].gr === 2) {
				combatTechniques[i].at = combatTechniques[i].value + this.getLeitMod(combatTechniques[i].leit);
			} else {
				combatTechniques[i].at = combatTechniques[i].value + this.getLeitMod(['ATTR_1']);
				combatTechniques[i].pa = Math.round(combatTechniques[i].value / 2) + this.getLeitMod(combatTechniques[i].leit);
			}
		}
		return combatTechniques;
	},

	getFilter: function() {
		return _filter;
	},

	getSortOrder: function() {
		return _sortOrder;
	}

});

CombatTechniquesStore.dispatchToken = AppDispatcher.register( function( payload ) {

	switch( payload.actionType ) {

		case ActionTypes.ADD_COMBATTECHNIQUE_POINT:
		case ActionTypes.REMOVE_COMBATTECHNIQUE_POINT:
			break;

		case ActionTypes.FILTER_COMBATTECHNIQUES:
			_updateFilterText(payload.text);
			break;

		case ActionTypes.SORT_COMBATTECHNIQUES:
			_updateSortOrder(payload.option);
			break;
		
		default:
			return true;
	}
	
	CombatTechniquesStore.emitChange();

	return true;

});

export default CombatTechniquesStore;
