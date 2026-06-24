import { lib, game, ui, get, ai, _status } from '../../../../../noname.js';
export { skill };
/** @type { importCardConfig.skill } */
const skill = {
	niaobaidaowenha_skill: {
		trigger: { player: 'loseMaxHpAfter' },
		forced: true,
		content() {
			'step 0';
			event.count = Math.min(trigger.num, 9);
			('step 1');
			event.count--;
			player.chooseTarget(get.prompt2('niaobaidaowenha_skill'), lib.filter.notMe).set('ai', function (target) {
				return get.attitude(_status.event.player, target) / (target.maxHp || 1);
			});
			('step 2');
			if (result.bool) {
				var target = result.targets[0];
				target.gainMaxHp();
				target.recover();
				if (event.count) {
					event.goto(1);
				}
			}
		},
	},
	goujiangdesidai_skill: {
		inherit: 'kagari_zongsi',
		filter(event, player) {
			return !player.hasSkill('kagari_zongsi') || player.getStat('skill').kagari_zongsi;
		},
	},
	gubuzifeng_disable: {
		init(player, skill) {
			if (!player.storage[skill]) {
				player.storage[skill] = [];
			}
		},
		onremove(player, skill) {
			player.enableSkill(skill);
			delete player.storage[skill];
		},
		charlotte: true,
		mark: true,
		intro: {
			content(storage, player, skill) {
				var list = [];
				for (var i in player.disabledSkills) {
					if (player.disabledSkills[i].includes(skill)) {
						list.push(i);
					}
				}
				if (list.length) {
					var str = '失效技能:';
					for (let i = 0; i < list.length; i++) {
						if (lib.translate[list[i] + '_info']) {
							str += get.translation(list[i]) + '、';
						}
					}
					return str.slice(0, str.length - 1);
				}
			},
		},
	},
	thedayibecomeagod: {
		trigger: { player: 'die' },
		forced: true,
		filter(event, player) {
			return player.group == 'shen';
		},
		forceDie: true,
		content() {
			'step 0';
			player
				.chooseTarget(get.prompt2('thedayibecomeagod'), function (card, player, target) {
					return target.isFriendsOf(player);
				})
				.set('forceDie', true).ai = function (target) {
				return get.attitude(_status.event.player, target);
			};
			('step 1');
			if (result.bool) {
				var target = result.targets[0];
				event.target = target;
				if (target.group != 'shen') {
					target.changeGroup('shen');
					game.log('此刻,便是', target, '成为神明之日!');
					event.finish();
				} else {
					target.turnOver(false);
				}
			} else {
				event.finish();
			}
			('step 2');
			if (target.isDamaged()) {
				target.recover(target.maxHp - target.hp);
			}
			('step 3');
			target.drawTo(5);
		},
	},
	TheDayIBecomeAGod: {
		trigger: { player: 'useCard1' },
		// ruleSkill:true,
		popup: false,
		// forced:true,
		prompt: '是否将此【杀】改为神属性？',
		filter(event, player) {
			return player.group == 'shen' && event.card.name == 'sha';
		},
		content() {
			game.log(trigger.card, '被改为神属性');
			// trigger.card.nature='kami';
			game.setNature(trigger.card, 'kami');
		},
	},
	shanrangzhaoshu: {
		trigger: { global: 'gainEnd' },
		forced: true,
		filter(event, player) {
			return event.player != player && event.player != _status.currentPhase && event.player.getHistory('gain')[0] == event && player.countCards('he') + event.player.countCards('he') > 0;
		},
		content() {
			'step 0';
			event.target = trigger.player;
			var list = [];
			if (player.countCards('he') > 1) {
				list.push('交给其一张牌');
			}
			if (trigger.player.countCards('he') > 0) {
				list.push('令其交给你一张牌');
			}
			event.list = list;
			player
				.chooseControl('cancel2')
				.set('choiceList', list)
				.set('prompt', get.prompt('shanrangzhaoshu', trigger.player))
				.set('ai', function () {
					if (get.attitude(_status.event.player, _status.event.getTrigger().player) < 0) {
						return _status.event.parent.list.length - 1;
					}
					return 'cancel2';
				});
			('step 1');
			if (result.control == 'cancel2') {
				event.finish();
				return;
			}
			if (event.list[result.index][0] == '令') {
				event.player = target;
				event.target = player;
			}
			('step 2');
			player.chooseCard('he', true).set('filterCard', function (card, player) {
				if (player != _status.event.getTrigger().player) {
					return card != player.getEquip('shanrangzhaoshu');
				}
				return true;
			});
			('step 3');
			if (result.cards && result.cards.length) {
				target.gain(result.cards, player, 'giveAuto');
			}
		},
	},
	lingsheji: {
		trigger: { player: 'phaseUseEnd' },
		equipSkill: true,
		forced: true,
		content() {
			'step 0';
			var list = ['摸一张牌'];
			if (player.countCards('he') > 1) {
				list.push('将一张牌置于武将牌上,于回合结束后获得之');
			}
			player
				.chooseControl('cancel2')
				.set('prompt', get.prompt('lingsheji'))
				.set('choiceList', list)
				.set('ai', function () {
					var player = _status.event.player;
					if (
						player.countCards('e', function (card) {
							return card.name != 'tengjia' && get.value(card) <= 0;
						})
					) {
						return 1;
					}
					if (!player.needsToDiscard()) {
						return 0;
					}
					return 1;
				});
			('step 1');
			if (result.control == 'cancel2') {
				event.finish();
				return;
			}
			if (result.index == 0) {
				player.draw();
				event.finish();
			} else {
				player
					.chooseCard('he', true, function (card, player) {
						return card != player.getEquip(5);
					})
					.set('ai', function (card) {
						if (get.position(card) == 'e' && get.value(card) <= 0) {
							return 10;
						}
						return (get.position(card) == 'h' ? 2 : 1) * -get.value(card);
					});
			}
			('step 2');
			player.addSkill('lingsheji2');
			player.lose(result.cards, ui.special, 'toStorage');
			player.markAuto('lingsheji2', result.cards);
		},
	},
	lingsheji2: {
		trigger: { player: 'phaseEnd' },
		equipSkill: true,
		forced: true,
		popup: false,
		content() {
			player.gain(player.getStorage('lingsheji2'), 'gain2', 'log');
			player.storage.lingsheji2.length = 0;
			player.removeSkill('lingsheji2');
		},
		intro: { content: 'cards' },
	},
	noda_axe: {
		trigger: { player: 'useCardToPlayered' },
		equipSkill: true,
		forced: true,
		filter(event, player) {
			return player.isPhaseUsing() && player != event.target && event.targets.length == 1 && player.countCards('he') > 2;
		},
		content() {
			'step 0';
			player
				.chooseToDiscard('he', get.prompt('noda_axe', trigger.target), 2, '弃置两张牌,令' + get.translation(trigger.target) + '本回合内不能使用或打出牌且防具技能无效', function (card, player) {
					return card != player.getEquip(1);
				})
				.set(
					'goon',
					(function (event, player) {
						if (player.hasSkill('noda_axe2')) {
							return false;
						}
						if (event.parent.excluded.includes(player)) {
							return false;
						}
						if (get.attitude(event.player, player) > 0) {
							return false;
						}
						if (get.type(event.card) == 'trick' && event.player.hasWuxie()) {
							return true;
						}
						if (get.tag(event.card, 'respondSha')) {
							if (!player.hasSha()) {
								return false;
							}
							return true;
						} else if (get.tag(event.card, 'respondShan')) {
							if (!player.hasShan()) {
								return false;
							}
							return true;
						}
						return false;
					})(trigger, trigger.target),
				)
				.set('ai', function (card) {
					if (_status.event.goon) {
						return 7.5 - get.value(card);
					}
					return 0;
				});
			('step 1');
			if (result.bool) {
				trigger.target.addTempSkill('noda_axe2');
			}
		},
	},
	noda_axe2: {
		equipSkill: true,
		mod: {
			cardEnabled() {
				return false;
			},
			cardSavable() {
				return false;
			},
			cardRespondable() {
				return false;
			},
		},
		mark: true,
		intro: {
			content: '不能使用或打出牌且防具技能无效直到回合结束',
		},
		ai: { unequip2: true },
	},
	iwasawa_crowbow: {
		equipSkill: true,
		trigger: {
			player: 'loseAfter',
			global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		forced: true,
		filter(event, player) {
			var evt = event.getl(player);
			return evt && evt.hs && evt.hs.length > 1 && player.isPhaseUsing();
		},
		content() {
			'step 0';
			var evt = trigger.getl(player);
			event.num = evt.hs.length;
			player
				.chooseTarget(get.prompt('iwasawa_crowbow'), '弃置一名其他角色的' + get.cnNumber(event.num) + '张牌', function (card, player, target) {
					return player != target && target.countDiscardableCards(player, 'he') > 0;
				})
				.set('ai', function (target) {
					var att = get.attitude(_status.event.player, target);
					if (target.countDiscardableCards(_status.event.player, 'he') >= _status.event.parent.num) {
						att = att * 2;
					}
					return -att;
				});
			('step 1');
			if (result.bool) {
				var target = result.targets[0];
				player.discardPlayerCard(target, 'he', true, num);
			}
		},
	},
	xiuluolianyuji2: {
		equipSkill: true,
		trigger: { player: 'damageEnd' },
		forced: true,
		popup: false,
		content() {
			if (trigger.xiuluolianyuji) {
				player.recover();
			}
			player.removeSkill('xiuluolianyuji2');
		},
	},
	xiuluolianyuji: {
		mod: {
			selectTarget(card, player, range) {
				if (card.name != 'sha') {
					return;
				}
				if (Array.isArray(range) && range[1] == -1) {
					return;
				}
				range[1] = Infinity;
			},
		},
		trigger: { source: 'damageBegin1' },
		forced: true,
		filter(event, player) {
			return event.card && event.card.name == 'sha';
		},
		content() {
			trigger.num++;
			trigger.xiuluolianyuji = true;
			trigger.player.addSkill('xiuluolianyuji2');
		},
	},
	// juechenjinge_gai:{
	// 	equipSkill:true,
	// 	global:'juechenjinge_gai2'
	// },
	// juechenjinge_gai2:{
	// 	equipSkill:true,
	// 	mod:{
	// 		globalTo:function(from,to,distance){
	// 			return distance+game.countPlayer(function(current){
	// 				if(current==to) return;
	// 				if(current.group!=to.group&&get.mode()=='guozhan') return;
	// 				if(current.hasSkill('juechenjinge_gai')) {
	// 					if(get.mode()=='boss')return 1;
	// 					return 2
	// 				}
	// 			});
	// 		}
	// 	}
	// },
	chiyanzhenhunqin: {
		equipSkill: true,
		trigger: { source: 'damageBegin1' },
		forced: true,
		content() {
			// trigger.nature='fire';
			game.setNature(trigger, 'fire');
		},
	},
	longfenghemingjian: {
		equipSkill: true,
		inherit: 'cixiong_skill',
		filter(event, player) {
			// return lib.linked.includes(event.card.nature);
			return event.card && event.card.hasNature('linked');
		},
	},
	// 'qicaishenlu':{
	// trigger:{source:'damageBegin1'},
	// forced:true,
	// filter:function(event,player){
	// // return lib.linked.includes(event.nature);
	// return event.card && event.card.hasNature('linked');
	// },
	// content:function(){
	// trigger.num++;
	// },
	// },
	honghuangzhili: {
		init(player) {
			player.disableSkill('honghuangzhili', 'boss_shenyi');
		},
		mark: true,
		nopop: true,
		intro: {
			content: '【神裔】无效直到下家的回合开始',
		},
		marktext: '荒',
		onremove(player) {
			player.enableSkill('honghuangzhili', 'boss_shenyi');
		},
		trigger: { global: 'phaseZhunbeiBegin' },
		forced: true,
		popup: false,
		filter(event, player) {
			return event.player == player.next;
		},
		content() {
			player.removeSkill('honghuangzhili');
		},
	},
	boss_yingzhong: {
		getList(type, outside) {
			let characters = [];
			if (type === 'highHp') {
				characters = [];
			}
			if (outside) {
				game.filterPlayer2((cur) => {
					characters.removeArray(get.nameList(cur));
				});
			}
			return characters.randomSort();
		},
		trigger: {
			player: 'phaseBegin',
		},
		filter(event, player, name) {
			return player.phaseNumber === 1;
		},
		forced: true,
		async content(event, trigger, player) {
			let num = 2,
				skills = [],
				characters = lib.skill.boss_yingzhong.getList();
			const func = (name) => {
				const ss = get.character(name, 3);
				if (ss.length) {
					skills.addArray(get.character(name, 3));
					return true;
				}
				return false;
			};
			for (const name of characters) {
				if (func(name)) {
					num--;
				}
				if (!num) {
					break;
				}
			}
			if (num && lib.rank) {
				//备用方案
				for (const r of ['s', 'ap', 'a', 'am']) {
					if (!Array.isArray(lib.rank[r])) {
						continue;
					}
					const ss = lib.rank[r].randomSort();
					for (const name of ss) {
						if (func(name)) {
							num--;
						}
						if (!num) {
							break;
						}
					}
					if (!num) {
						break;
					}
				}
			}
			if (skills.length) {
				await player.addSkills(skills);
			}
		},
	},
	niaobaidaowenha_skill: {
		trigger: { player: 'loseMaxHpAfter' },
		filter(event, player) {
			return game.hasPlayer((current) => current != player) && event.num > 0;
		},
		getIndex: (event) => event.num,
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt2(event.skill), lib.filter.notMe)
				.set('ai', (target) => {
					const player = get.player();
					return get.attitude(player, target) / (target.maxHp || 1);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const {
				targets: [target],
			} = event;
			await target.gainMaxHp();
			await target.recover();
		},
	},
	goujiangdesidai_skill: {
		inherit: 'kagari_zongsi',
		filter(event, player) {
			return !player.hasSkill('kagari_zongsi') || player.getStat('skill').kagari_zongsi;
		},
	},
	gubuzifeng_disable: {
		init(player, skill) {
			if (!player.storage[skill]) {
				player.storage[skill] = [];
			}
		},
		onremove(player, skill) {
			player.enableSkill(skill);
			delete player.storage[skill];
		},
		charlotte: true,
		mark: true,
		intro: {
			content(storage, player, skill) {
				var list = [];
				for (var i in player.disabledSkills) {
					if (player.disabledSkills[i].includes(skill)) {
						list.push(i);
					}
				}
				if (list.length) {
					var str = '失效技能:';
					for (let i = 0; i < list.length; i++) {
						if (lib.translate[list[i] + '_info']) {
							str += get.translation(list[i]) + '、';
						}
					}
					return str.slice(0, str.length - 1);
				}
			},
		},
	},
	thedayibecomeagod: {
		trigger: { player: 'die' },
		forced: true,
		filter(event, player) {
			return player.group == 'shen';
		},
		forceDie: true,
		content() {
			'step 0';
			player
				.chooseTarget(get.prompt2('thedayibecomeagod'), function (card, player, target) {
					return target.isFriendsOf(player);
				})
				.set('forceDie', true).ai = function (target) {
				return get.attitude(_status.event.player, target);
			};
			('step 1');
			if (result.bool) {
				var target = result.targets[0];
				event.target = target;
				if (target.group != 'shen') {
					target.changeGroup('shen');
					game.log('此刻,便是', target, '成为神明之日!');
					event.finish();
				} else {
					target.turnOver(false);
				}
			} else {
				event.finish();
			}
			('step 2');
			if (target.isDamaged()) {
				target.recover(target.maxHp - target.hp);
			}
			('step 3');
			target.drawTo(5);
		},
	},
	TheDayIBecomeAGod: {
		trigger: { player: 'useCard1' },
		ruleSkill: true,
		popup: false,
		forced: true,
		prompt: '是否将此【杀】改为神属性？',
		filter(event, player) {
			return player.group == 'shen' && event.card.name == 'sha';
		},
		content() {
			game.log(trigger.card, '被改为神属性');
			game.setNature(trigger.card, 'kami');
		},
	},
	shanrangzhaoshu: {
		trigger: {
			global: ['gainEnd', 'loseAsyncAfter'],
		},
		forced: true,
		filter(event, player) {
			let min = 0;
			if (!player.hasSkill('shanrangzhaoshu', null, false)) {
				min += get.sgn(player.getEquips('shanrangzhaoshu').length);
			}
			const bool = player.countCards('he') > min;
			return game.hasPlayer((current) => {
				if (current == player || current == _status.currentPhase) {
					return false;
				}
				if (!bool && current.countCards('h') == 0) {
					return false;
				}
				const history = current.getHistory('gain')[0];
				if (!history) {
					return false;
				}
				if (event.name == 'gain') {
					return history == event && event.getlx !== false;
				}
				return history.parent == event;
			});
		},
		content() {
			'step 0';
			event.targets = game
				.filterPlayer(function (current) {
					if (current == player || current == _status.currentPhase) {
						return false;
					}
					const history = current.getHistory('gain')[0];
					if (!history) {
						return false;
					}
					if (trigger.name == 'gain') {
						return history == trigger && trigger.getlx !== false;
					}
					return history.parent == trigger;
				})
				.sortBySeat(_status.currentPhase);
			('step 1');
			var target = event.targets.shift();
			event.target = target;
			if (target.isIn()) {
				var list = [];
				var min = 0;
				if (!player.hasSkill('shanrangzhaoshu', null, false)) {
					min += get.sgn(player.getEquips('shanrangzhaoshu').length);
				}
				if (player.countCards('he') > min) {
					list.push(`交给${get.translation(target)}一张牌`);
				}
				if (target.countCards('he') > 0) {
					list.push(`令${get.translation(target)}交给你一张牌`);
				}
				event.list = list;
				if (list.length == 0) {
					event.goto(4);
				} else if (list.length == 1) {
					event._result = { index: 0 };
				} else {
					player
						.chooseControl('cancel2')
						.set('choiceList', list)
						.set('prompt', get.prompt('shanrangzhaoshu', target))
						.set('ai', function () {
							if (get.attitude(_status.event.player, _status.event.parent.target) < 0) {
								return 1;
							}
							return 'cancel2';
						});
				}
			} else {
				event.goto(4);
			}
			('step 2');
			if (result.control == 'cancel2') {
				event.goto(4);
				return;
			}
			if (event.list[result.index][0] == '令') {
				event.gainner = player;
				event.giver = target;
				target.chooseCard('he', true, `交给${get.translation(player)}一张牌`);
			} else {
				event.giver = player;
				event.gainner = target;
				player
					.chooseCard('he', true, `交给${get.translation(target)}一张牌`)
					.set('filterCard', function (card, player) {
						if (_status.event.ignoreCard) {
							return true;
						}
						var cards = player.getEquips('shanrangzhaoshu');
						if (!cards.includes(card)) {
							return true;
						}
						return cards.some((cardx) => cardx != card && !ui.selected.cards.includes(cardx));
					})
					.set('ignoreCard', player.hasSkill('shanrangzhaoshu', null, false));
			}
			('step 3');
			if (result.cards && result.cards.length) {
				event.giver.give(result.cards, event.gainner);
			}
			('step 4');
			if (targets.length) {
				event.goto(1);
			}
		},
	},
	lingsheji: {
		trigger: { player: 'phaseUseEnd' },
		equipSkill: true,
		forced: true,
		content() {
			'step 0';
			var list = ['摸一张牌'];
			if (player.countCards('he') > 1) {
				list.push('将一张牌置于武将牌上,于回合结束后获得之');
			}
			player
				.chooseControl('cancel2')
				.set('prompt', get.prompt('lingsheji'))
				.set('choiceList', list)
				.set('ai', function () {
					var player = _status.event.player;
					if (
						player.countCards('e', function (card) {
							return card.name != 'tengjia' && get.value(card) <= 0;
						})
					) {
						return 1;
					}
					if (!player.needsToDiscard()) {
						return 0;
					}
					return 1;
				});
			('step 1');
			if (result.control == 'cancel2') {
				event.finish();
				return;
			}
			if (result.index == 0) {
				player.draw();
				event.finish();
			} else {
				player
					.chooseCard('he', true, function (card, player) {
						return card != player.getEquip(5);
					})
					.set('ai', function (card) {
						if (get.position(card) == 'e' && get.value(card) <= 0) {
							return 10;
						}
						return (get.position(card) == 'h' ? 2 : 1) * -get.value(card);
					});
			}
			('step 2');
			player.addSkill('lingsheji2');
			player.lose(result.cards, ui.special, 'toStorage');
			player.markAuto('lingsheji2', result.cards);
		},
	},
	lingsheji2: {
		trigger: { player: 'phaseEnd' },
		equipSkill: true,
		forced: true,
		popup: false,
		content() {
			player.gain(player.getStorage('lingsheji2'), 'gain2', 'log');
			player.storage.lingsheji2.length = 0;
			player.removeSkill('lingsheji2');
		},
		intro: { content: 'cards' },
	},
	noda_axe: {
		trigger: { player: 'useCardToPlayered' },
		equipSkill: true,
		forced: true,
		filter(event, player) {
			return player.isPhaseUsing() && player != event.target && event.targets.length == 1 && player.countCards('he') > 2;
		},
		content() {
			'step 0';
			player
				.chooseToDiscard('he', get.prompt('noda_axe', trigger.target), 2, '弃置两张牌,令' + get.translation(trigger.target) + '本回合内不能使用或打出牌且防具技能无效', function (card, player) {
					return card != player.getEquip(1);
				})
				.set(
					'goon',
					(function (event, player) {
						if (player.hasSkill('noda_axe2')) {
							return false;
						}
						if (event.parent.excluded.includes(player)) {
							return false;
						}
						if (get.attitude(event.player, player) > 0) {
							return false;
						}
						if (get.type(event.card) == 'trick' && event.player.hasWuxie()) {
							return true;
						}
						if (get.tag(event.card, 'respondSha')) {
							if (!player.hasSha()) {
								return false;
							}
							return true;
						} else if (get.tag(event.card, 'respondShan')) {
							if (!player.hasShan()) {
								return false;
							}
							return true;
						}
						return false;
					})(trigger, trigger.target),
				)
				.set('ai', function (card) {
					if (_status.event.goon) {
						return 7.5 - get.value(card);
					}
					return 0;
				});
			('step 1');
			if (result.bool) {
				trigger.target.addTempSkill('noda_axe2');
			}
		},
	},
	noda_axe2: {
		equipSkill: true,
		mod: {
			cardEnabled() {
				return false;
			},
			cardSavable() {
				return false;
			},
			cardRespondable() {
				return false;
			},
		},
		mark: true,
		intro: {
			content: '不能使用或打出牌且防具技能无效直到回合结束',
		},
		ai: { unequip2: true },
	},
	iwasawa_crowbow: {
		equipSkill: true,
		trigger: {
			player: 'loseAfter',
			global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		forced: true,
		filter(event, player) {
			var evt = event.getl(player);
			return evt && evt.hs && evt.hs.length > 1 && player.isPhaseUsing();
		},
		content() {
			'step 0';
			var evt = trigger.getl(player);
			event.num = evt.hs.length;
			player
				.chooseTarget(get.prompt('iwasawa_crowbow'), '弃置一名其他角色的' + get.cnNumber(event.num) + '张牌', function (card, player, target) {
					return player != target && target.countDiscardableCards(player, 'he') > 0;
				})
				.set('ai', function (target) {
					var att = get.attitude(_status.event.player, target);
					if (target.countDiscardableCards(_status.event.player, 'he') >= _status.event.parent.num) {
						att = att * 2;
					}
					return -att;
				});
			('step 1');
			if (result.bool) {
				var target = result.targets[0];
				player.discardPlayerCard(target, 'he', true, num);
			}
		},
	},
	boss_panguan: {
		audio: true,
		mod: {
			targetEnabled(card) {
				if (get.type(card) == 'delay') {
					return false;
				}
			},
		},
	},
	boss_juhun: {
		audio: true,
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			var list = game.filterPlayer(function (current) {
				return current != player;
			});
			if (list.length) {
				var target = list.randomGet();
				player.line(target);
				target[['turnOver', 'link'].randomGet()]();
			}
		},
	},
	boss_wangxiang: {
		audio: true,
		trigger: { player: 'die' },
		forced: true,
		forceDie: true,
		content() {
			game.countPlayer(function (current) {
				if (current != player && current.countCards('e')) {
					player.line(current);
					current.modedDiscard(current.getCards('e'));
				}
			});
		},
	},
	boss_xhuanren: {
		nobracket: true,
		global: 'boss_xhuanren2',
	},
	boss_xhuanren2: {
		trigger: { player: 'dieBegin' },
		forced: true,
		_priority: -10,
		fixed: true,
		charlotte: true,
		silent: true,
		popup: false,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			if (_status.shidianyanluo_level == undefined) {
				return false;
			}
			return player == game.boss;
		},
		content() {
			var next = game.createEvent('shidianyanluo_huanren', false, trigger.parent);
			next.player = player;
			next.forceDie = true;
			next.setContent(lib.skill.boss_xhuanren2.contentx);
		},
		contentx() {
			'step 0';
			('step 1');
			var list = [['boss_chujiangwang', 'boss_songdiwang', 'boss_wuguanwang', 'boss_yanluowang'], ['boss_bianchengwang', 'boss_taishanwang', 'boss_dushiwang', 'boss_pingdengwang'], ['boss_zhuanlunwang']][_status.shidianyanluo_level];
			if (list.length == 1) {
				event._result = { control: list[0] };
			} else {
				player.chooseControl(list).set('prompt', '请选择下一个出战的角色').set('forceDie', true).ai = function () {
					return list.randomGet();
				};
			}
			('step 2');
			_status.shidianyanluo_level++;
			game.changeBoss(result.control);
		},
	},
	boss_newhuanren: {
		nobracket: true,
		global: 'boss_newhuanren2',
		trigger: { global: 'gameStart' },
		popup: false,
		forced: true,
		superCharlotte: true,
		charlotte: true,
		fixed: true,
		content() {
			if (get.mode() != 'boss') {
				return;
			}
			//孟婆
			if (!_status.shidianyanluo_mengpo && Math.random() <= 0.4) {
				if (game.me != game.boss) {
					game.boss.changeSeat(6);
				} else {
					game.boss.nextSeat.changeSeat(3);
					game.boss.previousSeat.changeSeat(5);
				}
				//	game.addBossFellow(game.me==game.boss?1:7,'boss_mengpo');
				var fellow = game.addFellow(game.me == game.boss ? 1 : 7, 'boss_mengpo', 'zoominanim');
				if (_status.shidianyanluo_level != 0) {
					fellow.directgain(get.cards(4));
				}
				fellow.side = true;
				fellow.identity = 'zhong';
				fellow.setIdentity('zhong');
				game.addVideo('setIdentity', fellow, 'zhong');
				_status.shidianyanluo_mengpo = true;
			}
			var list = ['luxun', 're_luxun', 'zhangchunhua', 'zuoci', 're_zuoci', 're_yuji', 'xin_yuji', 'jiangfei', 'kongrong']; //禁将
			game.countPlayer(function (current) {
				if (current != game.boss) {
					for (let i = 0; i < list.length; i++) {
						if (current.name == list[i] || current.name2 == list[i]) {
							current.init(['sunce', 're_sunce', 'shen_sunce', 'sb_sunce'].randomGet());
						}
					}
				}
			});
		},
	},
	boss_newhuanren2: {
		trigger: { global: ['die'] },
		forced: true,
		_priority: -10,
		fixed: true,
		charlotte: true,
		silent: true,
		popup: false,
		forceDie: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			if (_status.shidianyanluo_level == undefined) {
				return false;
			}
			return player == game.boss && event.player == player;
		},
		content() {
			var next = game.createEvent('shidianyanluo_huanren', false, trigger.parent);
			next.player = player;
			next.forceDie = true;
			next.setContent(lib.skill.boss_newhuanren2.contentx);
		},
		contentx() {
			'step 0';
			var list = game.filterPlayer();
			for (var x = 0; x < list.length; x++) {
				list[x].removeSkill('diaohulishan');
				list[x].removeSkill('guogong2');
			}
			var list = game.boss.getEnemies();
			for (var x = 0; x < list.length; x++) {
				list[x].removeSkill('boss_wangshi2');
			}
			('step 1');
			var list = [['boss_chujiangwang', 'boss_songdiwang', 'boss_wuguanwang', 'boss_yanluowang'], ['boss_bianchengwang', 'boss_taishanwang', 'boss_dushiwang', 'boss_pingdengwang'], ['boss_zhuanlunwang']][_status.shidianyanluo_level];
			//如果mengpo死亡且50回合内通过第三关,list[2]变成地藏王
			if (game.phaseNumber <= 50 && _status.shidianyanluo_level == 2 && _status.shidianyanluo_mengpodie == true) {
				list = ['boss_dizangwang'];
			}
			if (
				_status.shidianyanluo_level == 2 &&
				game.boss
					.getEnemies()
					.map((cur) => {
						const names = get.nameList(cur);
						for (let name of names) {
							if (lib.rank.s.includes(name) || lib.rank.ap.includes(name) || lib.rank.a.includes(name) || lib.rank.am.includes(name)) {
								return name;
							}
						}
						return false;
					})
					.reduce((val, name) => {
						if (lib.rank.s.includes(name)) {
							return val + 1;
						}
						if (lib.rank.ap.includes(name)) {
							return val + 0.36;
						}
						if (lib.rank.a.includes(name)) {
							return val + 0.13;
						}
						if (lib.rank.am.includes(name)) {
							return val + 0.05;
						}
					}, 0) > Math.random()
			) {
				list = ['boss_shikieiki'];
			}
			if (list.length == 1) {
				event._result = { control: list[0] };
			} else {
				player
					.chooseControl(list)
					.set('forceDie', true)
					.set('choice', list.randomGet())
					.set('ai', function () {
						return _status.event.choice;
					}).prompt = '选择下一个登场的武将';
			}
			('step 2');
			_status.shidianyanluo_level++;
			game.changeBoss(result.control);
			//地藏王登场摸3
			if (result.control == 'boss_dizangwang') {
				game.boss.draw(3);
			}
			//计回合数
			var level = _status.shidianyanluo_level;
			//孟婆
			if (!_status.shidianyanluo_mengpo) {
				if (Math.random() <= 0.5 || level == 2) {
					if (game.me != game.boss) {
						game.boss.changeSeat(6);
					} else {
						game.boss.nextSeat.changeSeat(3);
						game.boss.previousSeat.changeSeat(5);
					}
					//game.addBossFellow();
					var fellow = game.addFellow(game.me == game.boss ? 1 : 7, 'boss_mengpo', 'zoominanim');
					if (_status.shidianyanluo_level != 0) {
						fellow.directgain(get.cards(4));
					}
					fellow.side = true;
					fellow.identity = 'zhong';
					fellow.setIdentity('zhong');
					game.addVideo('setIdentity', fellow, 'zhong');
					_status.shidianyanluo_mengpo = true;
				}
			} else {
				//移除孟婆
				game.countPlayer2(function (current) {
					if (current.name == 'boss_mengpo') {
						current.removed = true;
						current.classList.add('dead');
						current.remove();
						game.players.remove(current);
					}
				});
			}
			//然后是boss进行回合
			game.phaseLoop(game.boss);
		},
	},
	boss_bingfeng: {
		audio: true,
		trigger: { player: 'die' },
		forceDie: true,
		forced: true,
		filter(event, player) {
			return event.source && !event.source.isTurnedOver();
		},
		logTarget: 'source',
		content() {
			trigger.source.turnOver();
		},
	},
	boss_chujiangwang_weimu: { audio: true },
	boss_chujiangwang_fankui: { audio: true },
	boss_heisheng: {
		audio: true,
		trigger: { player: 'die' },
		forceDie: true,
		forced: true,
		content() {
			player.line(game.players.slice(0));
			game.countPlayer(function (current) {
				if (current != player) {
					current.link();
				}
			});
		},
	},
	boss_shengfu: {
		audio: true,
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		popup: false,
		content() {
			var list = [];
			game.countPlayer(function (current) {
				if (current == player) {
					return;
				}
				var es = current.getDiscardableCards(current, 'e', { subtype: ['equip3', 'equip4', 'equip6'] });
				if (es.length) {
					list.push([current, es]);
				}
			});
			if (list.length) {
				var current = list.randomGet();
				player.line(current[0]);
				current[0].discard(current[1].randomGet());
			}
		},
	},
	boss_songdiwang_enyuan: { audio: true },
	boss_zhiwang: {
		audio: true,
		derivation: 'boss_zhiwang_planetarian',
		trigger: { global: 'gainEnd' },
		filter(event, player) {
			return event.player != player && !(event.parent.name == 'draw' && event.getParent(2).name == 'phaseDraw') && event.player.countDiscardableCards(event.player, 'h');
		},
		forced: true,
		logTarget: 'player',
		content() {
			var evt = trigger.getParent('boss_zhiwang');
			if (evt && evt.name == 'boss_zhiwang') {
				trigger.player.uninit();
				trigger.player.init('sunce');
			}
			var hs = trigger.player.getDiscardableCards(trigger.player, 'h');
			if (hs.length) {
				trigger.player.discard(hs.randomGet());
			}
		},
		subSkill: { planetarian: {} },
	},
	boss_gongzheng: {
		audio: true,
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		filter(event, player) {
			return player.countDiscardableCards(player, 'j') > 0;
		},
		content() {
			player.discard(player.getDiscardableCards(player, 'j').randomGet());
		},
	},
	boss_xuechi: {
		audio: true,
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			var list = game.players.slice(0);
			list.remove(player);
			var target = list.randomGet();
			player.line(target);
			target.loseHp(2);
		},
	},
	boss_tiemian: {
		inherit: 'renwang_skill',
		_priority: -0.3,
		equipSkill: false,
		filter(event, player) {
			if (!player.hasEmptySlot(2)) {
				return false;
			}
			return lib.skill.renwang_skill.filter.apply(this, arguments);
		},
	},
	boss_zhadao: {
		inherit: 'qinggang_skill',
		equipSkill: false,
	},
	boss_zhuxin: {
		audio: true,
		trigger: { player: 'die' },
		forceDie: true,
		forced: true,
		content() {
			'step 0';
			player
				.chooseTarget('【诛心】:请选择一名角色,令其受到2点伤害', function (card, player, target) {
					return (
						target != player &&
						!game.hasPlayer(function (current) {
							return current != player && current != target && current.hp < target.hp;
						})
					);
				})
				.set('forceDie', true).ai = function (target) {
				return -get.attitude(_status.event.player, target);
			};
			('step 1');
			if (result.bool) {
				var target = result.targets[0];
				player.line(target);
				target.damage(2);
			}
		},
	},
	boss_leizhou: {
		audio: true,
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		content() {
			var list = game.players.slice(0);
			list.remove(player);
			if (list.length) {
				var target = list.randomGet();
				player.line(target);
				target.damage('thunder');
			}
		},
	},
	boss_leifu: {
		audio: true,
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			var list = game.players.slice(0);
			list.remove(player);
			if (list.length) {
				var target = list.randomGet();
				player.line(target);
				target.link();
			}
		},
	},
	boss_leizhu: {
		audio: true,
		trigger: { player: 'die' },
		forceDie: true,
		forced: true,
		content() {
			var list = game.players.slice(0);
			list.remove(player);
			if (list.length) {
				list.sort(lib.sort.seat);
				player.line(list);
				for (let i = 0; i < list.length; i++) {
					list[i].damage('thunder');
				}
			}
		},
	},
	boss_fudu: {
		audio: true,
		trigger: { global: 'useCard' },
		forced: true,
		filter(event, player) {
			return event.card && event.card.name == 'tao' && event.player != player && game.players.length > 2;
		},
		content() {
			var list = game.players.slice(0);
			list.remove(player);
			list.remove(trigger.player);
			var target = list.randomGet();
			player.line(target);
			target.loseHp();
		},
	},
	boss_kujiu: {
		audio: true,
		trigger: { global: 'phaseZhunbeiBegin' },
		forced: true,
		filter(event, player) {
			return event.player != player;
		},
		logTarget: 'player',
		content() {
			'step 0';
			trigger.player.loseHp();
			('step 1');
			trigger.player.useCard({ name: 'jiu' }, trigger.player);
		},
	},
	boss_renao: {
		audio: true,
		trigger: { player: 'die' },
		forceDie: true,
		forced: true,
		content() {
			var list = game.players.slice(0);
			list.remove(player);
			if (list.length) {
				var target = list.randomGet();
				player.line(target);
				target.damage(3, 'fire');
			}
		},
	},
	boss_remen: {
		trigger: { target: ['useCardToBefore'] },
		forced: true,
		_priority: 6,
		audio: true,
		filter(event, player) {
			if (!player.hasEmptySlot('equip2')) {
				return false;
			}
			if (event.card.name == 'nanman') {
				return true;
			}
			if (event.card.name == 'wanjian') {
				return true;
			}
			return event.card && event.card.name == 'sha' && !game.hasNature(event.card);
		},
		content() {
			trigger.cancel();
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (!target.hasEmptySlot('equip2')) {
						return;
					}
					if (card.name == 'nanman' || card.name == 'wanjian') {
						return 'zeroplayertarget';
					}
					if (card.name == 'sha') {
						var equip1 = player.getEquip(1);
						if (equip1 && equip1.name == 'zhuque') {
							return 1.9;
						}
						if (!game.hasNature(card)) {
							return 'zeroplayertarget';
						}
					}
				},
			},
		},
	},
	boss_zhifen: {
		audio: true,
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		content() {
			'step 0';
			var list = game.filterPlayer();
			list.remove(player);
			if (list.length) {
				var target = list.randomGet();
				player.line(target);
				event.target = target;
				if (target.countGainableCards(player, 'h')) {
					player.gainPlayerCard(target, 'h', true);
				}
			} else {
				event.finish();
			}
			('step 1');
			target.damage('fire');
		},
	},
	boss_huoxing: {
		audio: true,
		trigger: { player: 'die' },
		forceDie: true,
		forced: true,
		content() {
			var list = game.players.slice(0);
			list.remove(player);
			if (list.length) {
				list.sort(lib.sort.seat);
				player.line(list);
				for (let i = 0; i < list.length; i++) {
					list[i].damage('fire');
				}
			}
		},
	},
	boss_suozu: {
		audio: true,
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		content() {
			var list = game.players.slice(0);
			list.remove(player);
			if (list.length) {
				list.sort(lib.sort.seat);
				player.line(list);
				for (let i = 0; i < list.length; i++) {
					list[i].link();
				}
			}
		},
	},
	boss_abi: {
		audio: true,
		trigger: { player: 'damageEnd' },
		forced: true,
		filter(event, player) {
			return event.source != undefined;
		},
		logTarget: 'source',
		content() {
			trigger.source.damage().nature = ['fire', 'thunder'].randomGet();
		},
	},
	boss_pingdeng: {
		audio: true,
		trigger: { player: 'die' },
		forceDie: true,
		forced: true,
		content() {
			'step 0';
			var list = game.filterPlayer(function (current) {
				return (
					current != player &&
					!game.hasPlayer(function (current2) {
						return current2.hp > current.hp;
					})
				);
			});
			if (list.length) {
				var target = list.randomGet();
				player.line(target);
				target.damage(2).nature = lib.linked.randomGet();
			} else {
				event.finish();
			}
			('step 1');
			var list = game.filterPlayer(function (current) {
				return (
					current != player &&
					!game.hasPlayer(function (current2) {
						return current2.hp > current.hp;
					})
				);
			});
			if (list.length) {
				var target = list.randomGet();
				player.line(target);
				target.damage().nature = lib.linked.randomGet();
			}
		},
	},
	boss_lunhui: {
		audio: true,
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		filter(event, player) {
			return (
				player.hp <= 2 &&
				game.hasPlayer(function (current) {
					return current != player && current.hp > 2;
				})
			);
		},
		content() {
			var list = game.filterPlayer(function (current) {
				return current != player && current.hp > 2;
			});
			if (list.length) {
				var target = list.randomGet();
				player.line(target);
				var hp1 = player.hp;
				var hp2 = target.hp;
				player.hp = Math.min(player.maxHp, hp2);
				target.hp = Math.min(target.maxHp, hp1);
				player.update();
				target.update();
				game.log(player, '和', target, '交换了体力值');
			}
		},
	},
	boss_wangsheng: {
		audio: true,
		trigger: { player: 'phaseUseBegin' },
		forced: true,
		content() {
			var name = ['nanman', 'wanjian'].randomGet();
			player.useCard(
				{ name: name },
				game.filterPlayer(function (current) {
					return player.canUse({ name: name }, current);
				}),
				'noai',
			);
		},
	},
	boss_zlfanshi: {
		audio: true,
		trigger: { player: 'damageEnd' },
		forced: true,
		content() {
			if (player.hasSkill('boss_zlfanshi_terra')) {
				var list = game.players.slice(0);
				list.remove(player);
				if (list.length) {
					var target = list.randomGet();
					player.line(target);
					target.damage();
				}
			} else {
				player.addTempSkill('boss_zlfanshi_terra');
			}
		},
	},
	boss_zlfanshi_terra: { charlotte: true },
	//孟婆:
	boss_shiyou: {
		audio: true,
		trigger: { global: 'loseAfter' },
		filter(event, player) {
			var evt = event.getParent(3);
			return event.type == 'discard' && evt.name == 'phaseDiscard' && evt.player == event.player && evt.player != player && event.cards2 && event.cards2.filterInD('d').length;
		},
		content() {
			'step 0';
			event.cards = trigger.cards2.filterInD('d');
			('step 1');
			var next = player
				.chooseCardButton(get.prompt('boss_shiyou'), event.cards, [1, event.cards.length])
				.set('ai', function (button) {
					return get.value(button.link, player);
				})
				.set('filterButton', function (button) {
					for (let i = 0; i < ui.selected.buttons.length; i++) {
						if (ui.selected.buttons[i].link.suit == button.link.suit) {
							return false;
						}
					}
					return true;
				});
			('step 2');
			if (result.bool) {
				player.gain(result.links, 'gain2', 'log');
			}
		},
	},
	boss_wangshi: {
		trigger: { global: 'phaseZhunbeiBegin' },
		forced: true,
		audio: true,
		filter(event, player) {
			if (player.getEnemies().includes(event.player)) {
				return true;
			}
			return false;
		},
		logTarget: 'player',
		content() {
			var list = ['basic', 'trick', 'equip'].randomGet();
			trigger.player.addTempSkill('boss_wangshi2');
			trigger.player.storage.boss_wangshi2 = [list];
			game.log(trigger.player, '本回合不能使用或打出', list, '牌');
			trigger.player.markSkill('boss_wangshi2');
		},
	},
	boss_wangshi2: {
		charlotte: true,
		intro: {
			content(storage) {
				return '不能使用或打出' + get.translation(storage) + '牌';
			},
		},
		init(player, skill) {
			if (!player.storage[skill]) {
				player.storage[skill] = [];
			}
		},
		//mark:true,
		mod: {
			cardEnabled2(card, player) {
				if (player.storage.boss_wangshi2.includes(get.type(card, 'trick'))) {
					return false;
				}
			},
		},
	},
	boss_mengpohuihun1: {
		mode: ['boss'],
		trigger: {
			player: 'loseEnd',
			global: 'cardsDiscardEnd',
		},
		filter(event, player) {
			if (Array.isArray(event.cards))
				for (const i of event.cards) {
					if (i.name == 'boss_mengpohuihun' && get.position(i, true) == 'd') {
						return true;
					}
				}
			return false;
		},
		forced: true,
		popup: false,
		content() {
			var cards = [];
			if (Array.isArray(trigger.cards))
				for (const i of trigger.cards) {
					if (i.name == 'boss_mengpohuihun' && get.position(i) == 'd') {
						cards.push(i);
					}
				}
			if (cards.length) {
				game.cardsGotoSpecial(cards);
				game.log(cards, '已被移出游戏');
				player.popup('回魂');
			}
		},
	},
	boss_wanghun: {
		audio: true,
		forced: true,
		trigger: { player: 'die' },
		forceDie: true,
		content() {
			_status.shidianyanluo_mengpodie = true;
			var list = player.getEnemies();
			if (list.length) {
				for (var x = 0; x < list.length; x++) {
					list[x].removeSkill('boss_wangshi2');
				}
				var ran1 = list.randomGet(); //第一个角色
				list.remove(ran1); //移除
				var skills1 = ran1.getSkills(true, false);
				if (skills1.length) {
					for (let i = 0; i < skills1.length; i++) {
						//排除技能,然后随机失去一个可以失去的技能
						if (get.skills[i] || lib.skill[skills1[i]].charlotte || !lib.translate[skills1[i] + '_info'] || lib.skill[skills1[i]].zhuSkill == true) {
							skills1.splice(i--, 1);
						}
					}
					if (skills1.length) {
						skills1 = skills1.randomGet();
						ran1.disableSkill('boss_wanghun', skills1);
						game.log(ran1, '失去了', skills1);
					} else {
						game.log(ran1, '没有技能可失去');
					}
				}
				if (list.length) {
					var ran2 = list.randomGet(); //第二个角色
					list.remove(ran2); //移除
					var skills2 = ran2.getSkills(true, false);
					if (skills2.length) {
						for (let i = 0; i < skills2.length; i++) {
							//排除技能,然后随机失去一个可以失去的技能
							if (get.skills[i] || lib.skill[skills2[i]].charlotte || !lib.translate[skills2[i] + '_info'] || lib.skill[skills2[i]].zhuSkill == true) {
								skills2.splice(i--, 1);
							}
						}
						if (skills2.length) {
							skills2 = skills2.randomGet();
							ran2.disableSkill('boss_wanghun', skills2);
							game.log(ran2, '失去了', skills2);
						} else {
							game.log(ran2, '没有技能可失去');
						}
					}
				}
				//添加两张回魂
				if (get.mode() == 'boss') {
					var card1 = game.createCard('boss_mengpohuihun', 'heart', 3, null);
					var card2 = game.createCard('boss_mengpohuihun', 'club', 4, null);
					var a = [];
					if (ui.cardPile.childElementCount < 3) {
						game.boss.getCards(4);
					}
					for (let i = 0; i < ui.cardPile.childElementCount; i++) {
						a.push(i);
					}
					ui.cardPile.insertBefore(card1, ui.cardPile.childNodes[a.randomGet()]);
					a.push(a.length);
					ui.cardPile.insertBefore(card2, ui.cardPile.childNodes[a.randomGet()]);
					game.log('牌堆中添加了', card1, card2);
					game.updateRoundNumber();
				}
			}
		},
	},
	//地藏王:
	boss_bufo: {
		audio: true,
		forced: true,
		trigger: {
			player: ['damageBegin4', 'phaseZhunbeiBegin'],
		},
		filter(event, player, name) {
			if (name == 'damageBegin4') {
				return event.num && event.num > 1;
			}
			return game.hasPlayer(function (target) {
				return player != target && get.distance(player, target) <= 1;
			});
		},
		content() {
			var name = event.triggername;
			if (name == 'damageBegin4') {
				trigger.num--;
			} else {
				game.countPlayer(function (target) {
					if (player != target && get.distance(player, target) <= 1) {
						target.damage(1, player, 'fire');
					}
				});
			}
		},
	},
	boss_wuliang: {
		forced: true,
		audio: true,
		trigger: {
			global: 'gameDrawAfter',
			player: ['phaseZhunbeiBegin', 'phaseJieshuBegin', 'enterGame'],
		},
		filter(event, player, name) {
			if (name == 'gameDrawAfter' || name == 'enterGame') {
				return true;
			} else if (name == 'phaseZhunbeiBegin') {
				return player.hp < 3;
			}
			return true;
		},
		content() {
			var name = event.triggername;
			if (name == 'phaseZhunbeiBegin') {
				player.recover(3 - player.hp);
			} else {
				player.draw(name == 'gameDrawAfter' || name == 'enterGame' ? 3 : 2);
			}
		},
	},
	boss_dayuan: {
		trigger: {
			global: 'judge',
		},
		audio: true,
		forced: true,
		lastDo: true,
		content() {
			'step 0';
			var card = trigger.player.judging[0];
			var judge0 = trigger.judge(card);
			var judge1 = 0;
			var choice = 'cancel2';
			event.suitchoice = 'cancel2';
			var attitude = get.attitude(player, trigger.player);
			var list = [];
			event.suitx = ['heart', 'diamond', 'club', 'spade'];
			for (var x = 0; x < 4; x++) {
				for (let i = 1; i < 14; i++) {
					list.add(i);
					var judge2 =
						(trigger.judge({
							name: card.name,
							suit: event.suitx[x],
							number: i,
							nature: get.nature(card),
						}) -
							judge0) *
						attitude;
					if (judge2 > judge1) {
						choice = i;
						event.suitchoice = event.suitx[x];
						judge1 = judge2;
					}
				}
			}
			list.push('cancel2');
			event.suitx.push('cancel2');
			player
				.chooseControl(list)
				.set('ai', function () {
					return _status.event.choice;
				})
				.set('choice', choice).prompt = get.prompt2(event.name);
			('step 1');
			if (result.control != 'cancel2') {
				if (!event.logged) {
					event.logged = true;
				}
				game.log(trigger.player, '判定结果点数为', '#g' + result.control);
				player.popup(result.control, 'fire');
				if (!trigger.fixedResult) {
					trigger.fixedResult = {};
				}
				trigger.fixedResult.number = result.control;
			}
			player
				.chooseControl(event.suitx)
				.set('ai', function () {
					return _status.event.choice;
				})
				.set('choice', event.suitchoice).prompt = get.prompt2(event.name);
			('step 2');
			if (result.control != 'cancel2') {
				if (!event.logged) {
					event.logged = true;
				}
				game.log(trigger.player, '判定结果花色为', '#g' + result.control);
				player.popup(result.control, 'fire');
				if (!trigger.fixedResult) {
					trigger.fixedResult = {};
				}
				trigger.fixedResult.suit = result.control;
				if (result.control == 'club' || result.control == 'spade') {
					trigger.fixedResult.color = 'black';
				} else if (result.control == 'heart' || result.control == 'diamond') {
					trigger.fixedResult.color = 'red';
				}
			}
		},
	},
	boss_diting: {
		audio: true,
		mod: {
			globalFrom(from, to, distance) {
				return distance - 1;
			},
			globalTo(from, to, distance) {
				return distance + 1;
			},
		},
		enable: 'phaseUse',
		position: 'h',
		filter(event, player) {
			return player.countCards('he', { subtype: ['equip3', 'equip4', 'equip6'] }) > 0;
		},
		filterCard(card, player) {
			return get.subtype(card) == 'equip3' || get.subtype(card) == 'equip4' || get.subtype(card) == 'equip6';
		},
		check(card) {
			if (_status.event.player.isDisabled(get.subtype(card))) {
				return 5;
			}
			return 3 - get.value(card);
		},
		content() {
			player.draw();
		},
		discard: false,
		visible: true,
		loseTo: 'discardPile',
		prompt: '将一张坐骑牌置入弃牌堆并摸一张牌',
		delay: 0.5,
		prepare(cards, player) {
			player.$throw(cards, 1000);
			game.log(player, '将', cards, '置入了弃牌堆');
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
		group: 'boss_diting_init',
		subSkill: {
			init: {
				trigger: {
					global: 'gameStart',
					player: 'enterGame',
				},
				forced: true,
				filter(event, player) {
					return player.hasEnabledSlot(3) || player.hasEnabledSlot(4);
				},
				content() {
					var disables = [];
					for (let i = 3; i <= 4; i++) {
						for (var j = 0; j < player.countEnabledSlot(i); j++) {
							disables.push(i);
						}
					}
					if (disables.length) {
						player.disableEquip(disables);
					}
				},
			},
		},
	},
	/*
	"boss_sdyl_level":{
		trigger:{global:'gameStart'},
		forced:true,
		superCharlotte:true,
		charlotte:true,
		fixed:true,
		content:function(){},
		contentplayer:function(player){
			var list=[1,2,3,4,5];
			var list2=["boss_sdyl_playerlevel1","boss_sdyl_playerlevel2","boss_sdyl_playerlevel3","boss_sdyl_playerlevel4","boss_sdyl_playerlevel5"];
			player.removeAdditionalSkill('boss_sdyl_level');
			var num=list.randomGet();
			player.storage.boss_sdyl_level=num;
			var list3=list2.concat();
			list3.length=num;
			player.addAdditionalSkill('boss_sdyl_level',list3);
			game.log(player,'的等阶为',num);
			if(num>1){
				var a=function(card){
					return get.type(card)=='equip';
				};
				for(var i=0;i<ui.cardPile.childNodes.length;i++){
					if(a(ui.cardPile.childNodes[i])){
						player.chooseUseTarget(ui.cardPile.childNodes[i],'noanimate','nopopup',true);
						ui.cardPile.removeChild(ui.cardPile.childNodes[i]);
						player.update();
						break;
					}
				}
			}
		},
		contentboss:function(boss){
			var list=[1,2,3,4,5];
			var list2=["boss_sdyl_bosslevel1","boss_sdyl_bosslevel2","boss_sdyl_bosslevel3","boss_sdyl_bosslevel4","boss_sdyl_bosslevel5"];
			boss.removeAdditionalSkill('boss_sdyl_level');
			var num=list.randomGet();
			boss.storage.boss_sdyl_level=num;
			var list3=list2.concat();
			list3.length=num;
			boss.addAdditionalSkill('boss_sdyl_level',list3);
			game.log(boss,'的等阶为',num);
			if(num>1){
				var a=function(card){
					return get.type(card)=='equip';
				};
				for(var i=0;i<ui.cardPile.childNodes.length;i++){
					if(a(ui.cardPile.childNodes[i])){
						boss.chooseUseTarget(ui.cardPile.childNodes[i],'noanimate','nopopup',true);
						ui.cardPile.removeChild(ui.cardPile.childNodes[i]);
						boss.update();
						break;
					}
				}
			}
		},
	},
	"boss_sdyl_playerlevel1":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
	},
	"boss_sdyl_playerlevel3":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
		init:function(player){
			player.maxHp++;
			player.hp++;
			player.update();
		},
		mod:{
			cardUsable:function (card,player,num){
				if(card.name=='sha') return num+=1;
			},
		},
	},
	"boss_sdyl_playerlevel2":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
	},
	"boss_sdyl_playerlevel4":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
		trigger:{player:'phaseDrawBegin2'},
		forced:true,
		filter:function (event,player){
			return !event.numFixed;
		},
		content:function(){
			trigger.num++;
		},
	},
	"boss_sdyl_playerlevel5":{
		init:function(player){
			player.storage.boss_sdyl_playerlevel5=false;
			player.maxHp++;
			player.hp++;
			player.update();
		},
		audio:'niepan',
		unique:true,
		enable:'chooseToUse',
		mark:true,
		animationStr:'重生',
		limited:true,
		filter:function(event,player){
			if(player.storage.boss_sdyl_playerlevel5) return false;
			if(event.type=='dying'){
				if(player!=event.dying) return false;
				return true;
			}
			return false;
		},
		content:function(){
			'step 0'
			player.awakenSkill('boss_sdyl_playerlevel5');
			player.storage.boss_sdyl_playerlevel5=true;
			player.discard(player.getCards('j'));
			'step 1'
			player.link(false);
			'step 2'
			player.turnOver(false);
			'step 3'
			player.drawTo(Math.min(5,player.maxHp));
			'step 4'
			player.recover(player.maxHp-player.hp);
		},
		ai:{
			order:1,
			skillTagFilter:function(player){
				if(player.storage.boss_sdyl_playerlevel5) return false;
				if(player.hp>0) return false;
			},
			save:true,
			result:{
				player:function(player){
					if(player.hp<=0) return 10;
					if(player.hp<=2&&player.countCards('he')<=1) return 10;
					return 0;
				}
			},
			threaten:function(player,target){
				if(!target.storage.boss_sdyl_playerlevel5) return 0.6;
			}
		},
		intro:{
			content:'limited'
		}
	},
	"boss_sdyl_bosslevel1":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
	},
	"boss_sdyl_bosslevel3":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
		init:function(player){
			player.maxHp++;
			player.hp++;
			player.update();
		},
		trigger:{player:'phaseZhunbeiBegin'},
		forced:true,
		content:function(){
			var card=get.cardPile('sha');
			if(card){
				player.gain(card);
			}
		},
		mod:{
			cardUsable:function (card,player,num){
				if(card.name=='sha') return num+=1;
			},
		},
	},
	"boss_sdyl_bosslevel2":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
	},
	"boss_sdyl_bosslevel4":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
		trigger:{player:'phaseDrawBegin2'},
		forced:true,
		filter:function (event,player){
			return !event.numFixed;
		},
		content:function(){
			trigger.num++;
		},
		mod:{
			maxHandcard:function (player,num){
				return num+=1;
			},
		},
	},
	"boss_sdyl_bosslevel5":{
		fixed:true,
		globalFixed:true,
		charlotte:true,
		silent:true,
		popup:false,
		forced:true,
		init:function(player){
			player.maxHp++;
			player.hp++;
			player.update();
			if(_status.shidianyanluo_level&&_status.shidianyanluo_level>0){
				var players=game.filterPlayer(function(current){return current!=player;});
				player.useCard({name:'nanman'},false,players);
			}
		},
		trigger:{
			source:"damageBegin4",
			player:"useCardAfter",
			global:'gameDrawAfter',
		},
		filter:function (event,player,name){
			if(name=='gameDrawAfter'){
				if(!_status.shidianyanluo_level||_status.shidianyanluo_level==0){
					var players=game.filterPlayer(function(current){return current!=player;});
					player.useCard({name:'nanman'},false,players);
				}
				return false;
			}
			if(player.storage.boss_sdyl_bosslevel5) return false;
			if(name=='damageBegin4'){
				if(!event.card||event.card.name!='nanman') return false;
				return true;
			}else if(name=='useCardAfter'){
				if(!event.card||event.card.name!='nanman') return false;
				player.storage.boss_sdyl_bosslevel5=true;
				return false;
			}
		},
		content:function (){
			trigger.num++;
		},
	},
*/
	boss_jingjia: {},
	boss_aozhan: {
		forced: true,
		charlotte: true,
		group: ['boss_aozhan_wuqi', 'boss_aozhan_fangju', 'boss_aozhan_zuoji', 'boss_aozhan_baowu'],
		subSkill: {
			wuqi: {
				mod: {
					cardUsable(card, player, num) {
						if (player.getEquip(1) && card.name == 'sha') {
							return num + 1;
						}
					},
				},
			},
			fangju: {
				trigger: {
					player: 'damageBegin4',
				},
				forced: true,
				filter(event, player) {
					return player.getEquip(2) && event.num > 1;
				},
				content() {
					trigger.num = 1;
				},
			},
			zuoji: {
				trigger: {
					player: 'phaseDrawBegin',
				},
				forced: true,
				filter(event, player) {
					return player.getEquip(3) || player.getEquip(4);
				},
				content() {
					trigger.num++;
				},
			},
			baowu: {
				trigger: {
					player: 'phaseJudgeBefore',
				},
				forced: true,
				filter(event, player) {
					return player.getEquip(5);
				},
				content() {
					trigger.cancel();
					game.log(player, '跳过了判定阶段');
				},
			},
		},
	},
	boss_yaoshou: {
		mod: {
			globalFrom(from, to, distance) {
				return distance - 2;
			},
		},
	},
	boss_duqu: {
		trigger: { player: 'damageEnd' },
		filter(event, player) {
			return event.source && !event.source.hasSkill('boss_duqu');
		},
		content() {
			var target = trigger.source;
			if (!target.storage.boss_shedu) {
				target.storage.boss_shedu = 0;
			}
			target.storage.boss_shedu++;
			target.markSkill('boss_shedu');
		},
		forced: true,
		global: 'boss_shedu',
		mod: {
			cardname(card, player) {
				if (card.name == 'tao') {
					return 'sha';
				}
			},
		},
	},
	boss_shedu: {
		trigger: { player: 'phaseBegin' },
		mark: true,
		intro: { content: 'mark' },
		forced: true,
		sourceSkill: 'boss_duqu',
		filter(event, player) {
			return player.storage.boss_shedu && player.storage.boss_shedu > 0;
		},
		content() {
			'step 0';
			var num = player.storage.boss_shedu;
			event.num = num;
			var chs = get.cnNumber(num);
			player.chooseToDiscard('he', num, '弃置' + chs + '张牌,或失去' + chs + '点体力').ai = function (card) {
				return 12 - get.value(card);
			};
			('step 1');
			if (!result.bool) {
				player.loseHp(num);
			}
			player.storage.boss_shedu--;
			if (num > 1) {
				player.markSkill('boss_shedu');
			} else {
				player.unmarkSkill('boss_shedu');
			}
		},
	},
	boss_jiushou: {
		mod: {
			maxHandcard(player, num) {
				return num - player.hp + 9;
			},
		},
		trigger: { player: ['phaseUseBegin', 'phaseJieshuBegin', 'phaseDrawBegin'] },
		forced: true,
		filter(event, player) {
			return event.name == 'phaseDraw' || player.countCards('h') < 9;
		},
		content() {
			if (trigger.name == 'phaseDraw') {
				trigger.cancel();
			} else {
				player.draw(9 - player.countCards('h'));
			}
		},
	},
	boss_echou_switch: {
		charlotte: true,
		sourceSkill: 'boss_echou',
		group: ['boss_echou_switch_on', 'boss_echou_switch_off'],
		subSkill: {
			off: {
				trigger: { global: 'gameStart' },
				content() {
					player.disableSkill('boss_echou_awake', 'boss_echou');
				},
				silent: true,
			},
			on: {
				trigger: { player: 'changeHp' },
				filter(event, player) {
					return player.hp <= player.maxHp / 2;
				},
				forced: true,
				content() {
					player.enableSkill('boss_echou_awake');
					player.removeSkill('boss_echou_switch');
				},
			},
		},
	},
	boss_echou: {
		trigger: { global: 'useCard' },
		filter(event, player) {
			return !event.player.hasSkill('boss_duqu') && ['tao', 'jiu'].includes(event.card.name);
		},
		content() {
			var target = trigger.player;
			player.line(target);
			if (!target.storage.boss_shedu) {
				target.storage.boss_shedu = 0;
			}
			target.storage.boss_shedu++;
			target.markSkill('boss_shedu');
		},
	},
	boss_bingxian: {
		trigger: { global: 'phaseJieshuBegin' },
		filter(event, player) {
			return event.player != player && event.player.countUsed('sha', true) == 0;
		},
		forced: true,
		content() {
			player.useCard({ name: 'sha' }, trigger.player);
		},
	},
	boss_juyuan: {
		init(player, skill) {
			player.storage[skill] = 0;
		},
		trigger: { player: 'phaseAfter' },
		forced: true,
		silent: true,
		popup: false,
		content() {
			player.storage.boss_juyuan = player.hp;
		},
		mod: {
			selectTarget(card, player, range) {
				if (card.name != 'sha') {
					return;
				}
				if (Array.isArray(range) && range[1] == -1) {
					return;
				}
				if (player.hp >= player.storage.boss_juyuan) {
					return;
				}
				range[1] += 2;
			},
		},
	},
	boss_xushi_switch: {
		charlotte: true,
		sourceSkill: 'boss_xushi',
		group: ['boss_xushi_switch_on', 'boss_xushi_switch_off'],
		subSkill: {
			off: {
				trigger: { global: 'gameStart' },
				content() {
					player.disableSkill('boss_xushi_awake', 'boss_xushi');
				},
				silent: true,
			},
			on: {
				trigger: { player: 'changeHp' },
				filter(event, player) {
					return player.hp <= player.maxHp / 2;
				},
				forced: true,
				content() {
					player.enableSkill('boss_xushi_awake');
					player.removeSkill('boss_xushi_switch');
				},
			},
		},
	},
	boss_xushi: {
		trigger: { player: ['phaseUseEnd', 'turnOverEnd'] },
		filter(event, player) {
			return event.name == 'phaseUse' || !player.isTurnedOver();
		},
		forced: true,
		content() {
			'step 0';
			if (trigger.name == 'phaseUse') {
				player.turnOver();
				event.finish();
			} else {
				event.list = game.filterPlayer(function (current) {
					return current != player;
				});
				event.list.sort(lib.sort.seat);
				player.line(event.list, 'green');
			}
			('step 1');
			var target = event.list.shift();
			target.damage([1, 2].randomGet());
			if (event.list.length) {
				event.redo();
			}
		},
	},
	boss_zhaohuo: {
		trigger: {
			player: 'damageBegin4',
			source: 'damageBegin1',
		},
		forced: true,
		filter(event, player) {
			if (player == event.player) {
				return event.hasNature('fire') || player == event.source;
			}
			return true;
		},
		content() {
			if (player == trigger.player) {
				trigger.cancel();
			} else {
				game.setNature(trigger, 'fire');
			}
		},
		ai: {
			unequip: true,
			skillTagFilter(player) {
				if (player != _status.currentPhase) {
					return false;
				}
			},
		},
	},
	boss_honglianx: {
		mod: {
			ignoredHandcard(card, player) {
				if (get.color(card) == 'red') {
					return true;
				}
			},
			cardDiscardable(card, player, name) {
				if (name == 'phaseDiscard' && get.color(card) == 'red') {
					return false;
				}
			},
		},
		forced: true,
		trigger: { player: 'phaseZhunbeiBegin' },
		content() {
			'step 0';
			event.num1 = 3;
			event.num2 = [0, 1, 2, 3].randomGet();
			event.togain = [];
			while (event.togain.length < event.num2) {
				var card = get.cardPile(function (card) {
					return !event.togain.includes(card) && get.color(card) == 'red';
				});
				if (card) {
					event.togain.push(card);
				} else {
					break;
				}
			}
			event.num1 -= event.togain.length;
			if (event.togain.length) {
				player.gain(event.togain, 'draw');
			}
			if (event.num1 == 0) {
				event.finish();
			} else {
				event.list = game
					.filterPlayer(function (current) {
						return current != player;
					})
					.randomGets(event.num1)
					.sortBySeat();
				player.line(event.list, 'fire');
			}
			('step 1');
			var target = event.list.shift();
			target.damage('fire');
			if (event.list.length) {
				event.redo();
			}
		},
	},
	boss_yanyu_switch: {
		charlotte: true,
		sourceSkill: 'boss_yanyu',
		group: ['boss_yanyu_switch_on', 'boss_yanyu_switch_off'],
		subSkill: {
			off: {
				trigger: { global: 'gameStart' },
				content() {
					player.disableSkill('boss_yanyu_awake', 'boss_yanyu');
				},
				silent: true,
			},
			on: {
				trigger: { player: 'changeHp' },
				filter(event, player) {
					return player.hp <= player.maxHp / 2;
				},
				forced: true,
				content() {
					player.enableSkill('boss_yanyu_awake');
					player.removeSkill('boss_yanyu_switch');
				},
			},
		},
	},
	boss_yanyu: {
		forced: true,
		trigger: { global: 'phaseBegin' },
		filter(event, player) {
			return player != event.player;
		},
		getIndex: 3,
		logTarget: 'player',
		async content(event, trigger, player) {
			const { player: target } = trigger;
			player.line(target, 'fire');
			const netx = target.judge((card) => {
				if (get.color(card) == 'red') {
					return -5;
				}
				return 5;
			});
			netx.judge2 = (result) => result.bool;
			const result = await netx.forResult();
			if (!result?.bool) {
				target.damage('fire');
			}
		},
	},
	boss_fengdong: {
		trigger: { player: 'phaseBegin' },
		forced: true,
		content() {
			game.countPlayer(function (current) {
				if (current != player) {
					current.addTempSkill('fengyin');
				}
			});
		},
	},
	boss_xunyou: {
		trigger: { global: 'phaseBegin' },
		forced: true,
		filter(event, player) {
			return player != event.player;
		},
		content() {
			'step 0';
			var list = game.filterPlayer(function (current) {
				return current != player && current.countCards('hej');
			});
			if (list.length) {
				var target = list.randomGet();
				player.line(target, 'green');
				var card = target.getCards('hej').randomGet();
				event.card = card;
				player.gain(card, target);
				target.$giveAuto(card, player);
			} else {
				event.finish();
			}
			('step 1');
			if (player.getCards('h').includes(card) && get.type(card) == 'equip') {
				player.chooseUseTarget(card, true, 'nopopup', 'noanimate');
			}
		},
	},
	boss_sipu_switch: {
		charlotte: true,
		sourceSkill: 'boss_sipu',
		group: ['boss_sipu_switch_on', 'boss_sipu_switch_off'],
		subSkill: {
			off: {
				trigger: { global: 'gameStart' },
				content() {
					player.disableSkill('boss_sipu_awake', 'boss_sipu');
				},
				silent: true,
			},
			on: {
				trigger: { player: 'changeHp' },
				filter(event, player) {
					return player.hp <= player.maxHp / 2;
				},
				forced: true,
				content() {
					player.enableSkill('boss_sipu_awake');
					player.removeSkill('boss_sipu_switch');
				},
			},
		},
	},
	boss_sipu: {
		global: 'boss_sipu2',
	},
	boss_sipu2: {
		mod: {
			cardEnabled(card, player) {
				var sc = _status.currentPhase;
				if (sc && sc != player && sc.isPhaseUsing() && sc.hasSkill('boss_sipu') && !sc.hasSkill('boss_sipu_switch') && sc.countUsed() < 3) {
					return false;
				}
			},
			cardUsable(card, player) {
				var sc = _status.currentPhase;
				if (sc && sc != player && sc.isPhaseUsing() && sc.hasSkill('boss_sipu') && !sc.hasSkill('boss_sipu_switch') && sc.countUsed() < 3) {
					return false;
				}
			},
			cardRespondable(card, player) {
				var sc = _status.currentPhase;
				if (sc && sc != player && sc.isPhaseUsing() && sc.hasSkill('boss_sipu') && !sc.hasSkill('boss_sipu_switch') && sc.countUsed() < 3) {
					return false;
				}
			},
			cardSavable(card, player) {
				var sc = _status.currentPhase;
				if (sc && sc != player && sc.isPhaseUsing() && sc.hasSkill('boss_sipu') && !sc.hasSkill('boss_sipu_switch') && sc.countUsed() < 3) {
					return false;
				}
			},
		},
	},
	/*----分界线----*/
	boss_zirun: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		logTarget() {
			return game.filterPlayer();
		},
		content() {
			var list = game.filterPlayer().sortBySeat();
			game.asyncDraw(list, function (current) {
				if (current.countCards('e')) {
					return 2;
				}
				return 1;
			});
		},
	},
	boss_juehong: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		logTarget(event, player) {
			return player.getEnemies().length;
		},
		content() {
			'step 0';
			event.list = player.getEnemies().sortBySeat();
			('step 1');
			if (event.list.length) {
				var target = event.list.shift();
				if (target.countCards('he')) {
					var es = target.getCards('e');
					if (es.length) {
						target.modedDiscard(es);
					} else {
						player.discardPlayerCard(target, 'h', true);
					}
				}
				event.redo();
			}
		},
	},
	boss_zaoyi: {
		trigger: { global: 'dieAfter' },
		forced: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			var list = ['boss_shuishenxuanming', 'boss_shuishengonggong'];
			if (list.includes(event.player.name)) {
				return !game.hasPlayer(function (current) {
					return list.includes(current.name);
				});
			}
			return false;
		},
		content() {
			player.draw(4);
			player.addSkill('boss_zaoyi_hp');
		},
		subSkill: {
			hp: {
				trigger: { player: 'phaseZhunbeiBegin' },
				forced: true,
				mark: true,
				intro: {
					content: '每个回合开始时使体力值最少的敌方角色失去所有体力',
				},
				content() {
					var list = player.getEnemies();
					var min = list[0].hp;
					for (let i = 0; i < list.length; i++) {
						if (list[i].hp < min) {
							min = list[i].hp;
						}
					}
					for (let i = 0; i < list.length; i++) {
						if (list[i].hp > min) {
							list.splice(i--, 1);
						}
					}
					player.line(list, 'green');
					list.sortBySeat();
					for (let i = 0; i < list.length; i++) {
						list[i].loseHp(min);
					}
				},
			},
		},
		mod: {
			targetEnabled(card, player, target, now) {
				if (target.isEnemiesOf(player)) {
					var type = get.type(card, 'trick');
					if (type == 'trick') {
						if (
							game.hasPlayer(function (current) {
								return current.name == 'boss_shuishenxuanming';
							})
						) {
							return false;
						}
					}
					if (type == 'basic') {
						if (
							game.hasPlayer(function (current) {
								return current.name == 'boss_shuishengonggong';
							})
						) {
							return false;
						}
					}
				}
			},
		},
	},
	boss_lingqu: {
		init(player) {
			player.storage.boss_lingqu = 0;
		},
		trigger: { player: 'damageEnd' },
		forced: true,
		content() {
			player.draw();
			player.storage.boss_lingqu++;
			player.markSkill('boss_lingqu');
		},
		intro: {
			content: '手牌上限+#',
		},
		mod: {
			maxHandcard(player, num) {
				return num + player.storage.boss_lingqu;
			},
		},
		group: 'boss_lingqu_cancel',
		subSkill: {
			cancel: {
				trigger: { player: 'damageBegin4' },
				_priority: -11,
				forced: true,
				filter(event, player) {
					return event.num > 1;
				},
				content() {
					trigger.num = 0;
				},
			},
		},
	},
	boss_baiyi: {
		group: ['boss_baiyi_draw', 'boss_baiyi_thunder', 'boss_baiyi_discard'],
		subSkill: {
			discard: {
				trigger: { global: 'roundStart' },
				forced: true,
				filter(event, player) {
					return game.roundNumber == 5;
				},
				logTarget(event, player) {
					return player.getEnemies();
				},
				content() {
					'step 0';
					event.list = player.getEnemies();
					('step 1');
					if (event.list.length) {
						event.list.shift().chooseToDiscard('he', true, 2);
						event.redo();
					}
				},
			},
			draw: {
				trigger: { global: 'phaseDrawBegin' },
				forced: true,
				filter(event, player) {
					return game.roundNumber < 3 && event.player.isEnemiesOf(player);
				},
				content() {
					trigger.num--;
				},
			},
			thunder: {
				trigger: { player: 'damageBegin4' },
				filter(event, player) {
					return event.hasNature('thunder') && game.roundNumber < 7;
				},
				forced: true,
				content() {
					trigger.cancel();
				},
				ai: {
					nothunder: true,
					skillTagfilter(event, player) {
						return game.roundNumber < 7;
					},
					effect: {
						target(card, player, target, current) {
							if (get.tag(card, 'thunderDamage') && game.roundNumber < 7) {
								return 0;
							}
						},
					},
				},
			},
		},
	},
	boss_qingzhu: {
		trigger: { player: 'phaseDiscardBefore' },
		forced: true,
		content() {
			trigger.cancel();
		},
		mod: {
			cardEnabled(card, player) {
				if (card.name == 'sha' && _status.currentPhase == player && _status.event.getParent('phaseUse') && !player.hasSkill('boss_jiding')) {
					return false;
				}
			},
		},
	},
	boss_jiazu: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		getTargets(player) {
			var targets = [];
			targets.add(player.next);
			targets.add(player.previous);
			var enemies = player.getEnemies();
			for (let i = 0; i < targets.length; i++) {
				if (!enemies.includes(targets[i]) || (!targets[i].getEquip(3) && !targets[i].getEquip(4))) {
					targets.splice(i--, 1);
				}
			}
			return targets;
		},
		filter(event, player) {
			return lib.skill.boss_jiazu.getTargets(player).length;
		},
		logTarget(event, player) {
			return lib.skill.boss_jiazu.getTargets(player);
		},
		content() {
			'step 0';
			event.list = lib.skill.boss_jiazu.getTargets(player).sortBySeat();
			('step 1');
			if (event.list.length) {
				var target = event.list.shift();
				var cards = target.getDiscardableCards(target, 'e', function (card) {
					var subtype = get.subtype(card);
					return subtype == 'equip3' || subtype == 'equip4';
				});
				if (cards.length) {
					target.discard(cards);
				}
				event.redo();
			}
		},
	},
	boss_jiding: {
		trigger: { global: 'damageEnd' },
		forced: true,
		mark: true,
		intro: {
			content: 'info',
		},
		filter(event, player) {
			return event.player != player && event.player.isFriendsOf(player) && event.source && event.source.isIn() && event.source.isEnemiesOf(player);
		},
		logTarget: 'source',
		content() {
			'step 0';
			player.useCard({ name: 'sha', nature: 'thunder' }, trigger.source);
			('step 1');
			player.removeSkill('boss_jiding');
		},
		group: 'boss_jiding_recover',
		subSkill: {
			recover: {
				trigger: { source: 'damageEnd' },
				silent: true,
				filter(event, player) {
					return event.getParent(3).name == 'boss_jiding';
				},
				content() {
					for (const i of game.players) {
						if (i.name == 'boss_jinshenrushou') {
							i.recover();
							player.line(i, 'green');
						}
					}
				},
			},
		},
	},
	boss_xingqiu: {
		init(player) {
			player.storage.boss_xingqiu = false;
		},
		trigger: { player: 'phaseDrawBegin' },
		forced: true,
		content() {
			'step 0';
			if (player.storage.boss_xingqiu) {
				event.list = player.getEnemies().sortBySeat();
			} else {
				event.finish();
			}
			player.storage.boss_xingqiu = !player.storage.boss_xingqiu;
			('step 1');
			if (event.list.length) {
				var target = event.list.shift();
				if (!target.isLinked()) {
					target.link();
					player.line(target, 'green');
				}
				event.redo();
			}
			('step 2');
			for (const i of game.players) {
				if (i.name == 'boss_mingxingzhu') {
					i.addSkill('boss_jiding');
				}
			}
		},
	},
	boss_kuangxiao: {
		mod: {
			targetInRange(card, player, target) {
				return true;
			},
			selectTarget(card, player, range) {
				if (card.name == 'sha') {
					range[1] = -1;
					range[0] = -1;
				}
			},
			playerEnabled(card, player, target) {
				if (card.name == 'sha' && target.isFriendsOf(player)) {
					return false;
				}
			},
		},
	},
	boss_yinzei_switch: {
		charlotte: true,
		sourceSkill: 'boss_yinzei',
		group: ['boss_yinzei_switch_on', 'boss_yinzei_switch_off'],
		subSkill: {
			off: {
				trigger: { global: 'gameStart' },
				content() {
					player.disableSkill('boss_yinzei_awake', 'boss_yinzei');
				},
				silent: true,
			},
			on: {
				trigger: { player: 'changeHp' },
				filter(event, player) {
					return player.hp <= player.maxHp / 2;
				},
				forced: true,
				content() {
					player.enableSkill('boss_yinzei_awake');
					player.removeSkill('boss_yinzei_switch');
				},
			},
		},
	},
	boss_jicai_switch: {
		charlotte: true,
		sourceSkill: 'boss_jicai',
		group: ['boss_jicai_switch_on', 'boss_jicai_switch_off'],
		subSkill: {
			off: {
				trigger: { global: 'gameStart' },
				content() {
					player.disableSkill('boss_jicai_awake', 'boss_jicai');
				},
				silent: true,
			},
			on: {
				trigger: { player: 'changeHp' },
				filter(event, player) {
					return player.hp <= player.maxHp / 2;
				},
				forced: true,
				content() {
					player.enableSkill('boss_jicai_awake');
					player.removeSkill('boss_jicai_switch');
				},
			},
		},
	},
	boss_luanchang_switch: {
		charlotte: true,
		sourceSkill: 'boss_luanchang',
		group: ['boss_luanchang_switch_on', 'boss_luanchang_switch_off'],
		subSkill: {
			off: {
				trigger: { global: 'gameStart' },
				content() {
					player.disableSkill('boss_luanchang_awake', 'boss_luanchang');
				},
				silent: true,
			},
			on: {
				trigger: { player: 'changeHp' },
				filter(event, player) {
					return player.hp <= player.maxHp / 2;
				},
				forced: true,
				content() {
					player.enableSkill('boss_luanchang_awake');
					player.removeSkill('boss_luanchang_switch');
				},
			},
		},
	},
	boss_yandu_switch: {
		charlotte: true,
		sourceSkill: 'boss_yandu',
		group: ['boss_yandu_switch_on', 'boss_yandu_switch_off'],
		subSkill: {
			off: {
				trigger: { global: 'gameStart' },
				content() {
					player.disableSkill('boss_yandu_awake', 'boss_yandu');
				},
				silent: true,
			},
			on: {
				trigger: { player: 'changeHp' },
				filter(event, player) {
					return player.hp <= player.maxHp / 2;
				},
				forced: true,
				content() {
					player.enableSkill('boss_yandu_awake');
					player.removeSkill('boss_yandu_switch');
				},
			},
		},
	},
	boss_shenwuzaishi: {
		trigger: { global: 'dieAfter' },
		silent: true,
		filter(event, player) {
			return player.side != game.boss.side;
		},
		content() {
			if (player == trigger.source && trigger.player.name == 'boss_zhuyin') {
				player.draw(3);
				player.recover();
			} else if (trigger.player.side == player.side) {
				player.draw(player.group == 'shen' ? 3 : 1);
				player.recover();
			}
		},
	},
	boss_wuzang: {
		trigger: { player: 'phaseDrawBegin' },
		forced: true,
		content() {
			trigger.num += Math.max(5, Math.floor(player.hp / 2)) - 2;
		},
		mod: {
			maxHandcard(player, num) {
				return num - player.hp;
			},
		},
	},
	boss_xiangde: {
		trigger: { player: 'damageBegin3' },
		forced: true,
		filter(event, player) {
			return event.source && event.source.isIn() && event.source != player && event.source.getEquip(1);
		},
		content() {
			trigger.num++;
		},
	},
	boss_yinzei: {
		trigger: { player: 'damageEnd' },
		forced: true,
		logTarget: 'source',
		filter(event, player) {
			return event.source && event.source.isIn() && event.source != player && event.source.countCards('he') && !player.countCards('h');
		},
		content() {
			trigger.source.randomDiscard();
		},
	},
	boss_zhue: {
		trigger: { global: 'damageEnd' },
		forced: true,
		filter(event, player) {
			return event.source && event.source.isIn() && event.source != player;
		},
		logTarget: 'source',
		content() {
			game.asyncDraw([player, trigger.source]);
		},
	},
	boss_yandu: {
		trigger: { global: 'phaseJieshuBegin' },
		filter(event, player) {
			return event.player != player && !event.player.getStat('damage') && event.player.countCards('he');
		},
		logTarget: 'player',
		forced: true,
		content() {
			player.gainPlayerCard(trigger.player, true);
		},
	},
	boss_futai: {
		global: 'boss_futai2',
		trigger: { player: 'phaseZhunbeiBegin' },
		logTarget(event, player) {
			return game.filterPlayer(function (current) {
				return current.isDamaged();
			});
		},
		forced: true,
		content() {
			'step 0';
			var list = game
				.filterPlayer(function (current) {
					return current.isDamaged();
				})
				.sortBySeat();
			event.list = list;
			('step 1');
			if (event.list.length) {
				event.list.shift().recover();
				event.redo();
			}
		},
	},
	boss_futai2: {
		mod: {
			cardSavable(card, player) {
				if (
					card.name == 'tao' &&
					!_status.event.skill &&
					game.hasPlayer(function (current) {
						return current != player && current.hasSkill('boss_futai') && _status.currentPhase != current;
					})
				) {
					return false;
				}
			},
			cardEnabled(card, player) {
				if (
					card.name == 'tao' &&
					!_status.event.skill &&
					game.hasPlayer(function (current) {
						return current != player && current.hasSkill('boss_futai') && _status.currentPhase != current;
					})
				) {
					return false;
				}
			},
		},
	},
	boss_luanchang: {
		group: ['boss_luanchang_begin', 'boss_luanchang_end'],
		subSkill: {
			begin: {
				trigger: { player: 'phaseZhunbeiBegin' },
				forced: true,
				content() {
					var list = game
						.filterPlayer(function (current) {
							return player.canUse('nanman', current);
						})
						.sortBySeat();
					if (list.length) {
						player.useCard({ name: 'nanman' }, list);
					}
				},
			},
			end: {
				trigger: { player: 'phaseJieshuBegin' },
				forced: true,
				content() {
					var list = game
						.filterPlayer(function (current) {
							return player.canUse('wanjian', current);
						})
						.sortBySeat();
					if (list.length) {
						player.useCard({ name: 'wanjian' }, list);
					}
				},
			},
		},
	},
	boss_nitai: {
		group: ['boss_nitai_in', 'boss_nitai_out'],
		subSkill: {
			in: {
				trigger: { player: 'damageBegin4' },
				forced: true,
				filter(event, player) {
					return _status.currentPhase == player;
				},
				content() {
					trigger.cancel();
				},
			},
			out: {
				trigger: { player: 'damageBegin1' },
				forced: true,
				filter(event, player) {
					return _status.currentPhase != player && event.hasNature('fire');
				},
				content() {
					trigger.num++;
				},
			},
		},
	},
	boss_minwan: {
		group: ['boss_minwan_clear', 'boss_minwan_draw', 'boss_minwan_add'],
		subSkill: {
			clear: {
				trigger: { player: 'phaseAfter' },
				silent: true,
				content() {
					delete player.storage.boss_minwan;
				},
			},
			draw: {
				trigger: { player: 'useCard' },
				forced: true,
				filter(event, player) {
					return _status.currentPhase == player && Array.isArray(player.storage.boss_minwan);
				},
				content() {
					player.draw();
				},
			},
			add: {
				trigger: { source: 'damageAfter' },
				filter(event, player) {
					return _status.currentPhase == player;
				},
				forced: true,
				content() {
					if (!player.storage.boss_minwan) {
						player.storage.boss_minwan = [player];
					}
					player.storage.boss_minwan.add(trigger.player);
				},
			},
		},
		mod: {
			playerEnabled(card, player, target) {
				if (_status.currentPhase == player && Array.isArray(player.storage.boss_minwan) && !player.storage.boss_minwan.includes(target)) {
					return false;
				}
			},
		},
	},
	boss_tanyu: {
		trigger: { player: 'phaseDiscardBefore' },
		forced: true,
		content() {
			trigger.cancel();
		},
		group: 'boss_tanyu_hp',
		subSkill: {
			hp: {
				trigger: { player: 'phaseJieshuBegin' },
				forced: true,
				popup: false,
				filter(event, player) {
					return player.isMaxHandcard();
				},
				content() {
					player.loseHp();
				},
			},
		},
	},
	boss_cangmu: {
		trigger: { player: 'phaseDrawBegin' },
		forced: true,
		content() {
			trigger.num += game.countPlayer() - 2;
		},
	},
	boss_jicai: {
		trigger: { global: 'recoverAfter' },
		forced: true,
		logTarget: 'player',
		content() {
			if (trigger.player == player) {
				player.draw(2);
			} else {
				game.asyncDraw([player, trigger.player]);
			}
		},
	},
	boss_xiongshou: {
		group: ['boss_xiongshou_turn', 'boss_xiongshou_damage'],
		subSkill: {
			damage: {
				trigger: { source: 'damageBegin1' },
				forced: true,
				filter(event, player) {
					return event.notLink() && event.card && event.card.name == 'sha' && event.player.hp < player.hp;
				},
				content() {
					trigger.num++;
				},
			},
			turn: {
				trigger: { player: 'turnOverBefore' },
				_priority: 20,
				forced: true,
				filter(event, player) {
					return !player.isTurnedOver();
				},
				content() {
					trigger.cancel();
					game.log(player, '取消了翻面');
				},
			},
		},
		mod: {
			globalFrom(from, to, distance) {
				return distance - 1;
			},
		},
		ai: {
			noturn: true,
		},
	},
	xiuluolianyuji2: {
		equipSkill: true,
		trigger: { player: 'damageEnd' },
		forced: true,
		popup: false,
		content() {
			if (trigger.xiuluolianyuji) {
				player.recover();
			}
			player.removeSkill('xiuluolianyuji2');
		},
	},
	xiuluolianyuji: {
		mod: {
			selectTarget(card, player, range) {
				if (card.name != 'sha') {
					return;
				}
				if (Array.isArray(range) && range[1] == -1) {
					return;
				}
				range[1] = Infinity;
			},
		},
		trigger: { source: 'damageBegin1' },
		forced: true,
		filter(event, player) {
			return event.card && event.card.name == 'sha';
		},
		content() {
			trigger.num++;
			trigger.xiuluolianyuji = true;
			trigger.player.addSkill('xiuluolianyuji2');
		},
	},
	juechenjinge: {
		equipSkill: true,
		global: 'juechenjinge2',
	},
	juechenjinge2: {
		equipSkill: true,
		mod: {
			globalTo(from, to, distance) {
				return (
					distance +
					game.countPlayer(function (current) {
						if (current == to) {
							return;
						}
						if (current.side != to.side) {
							return;
						}
						if (current.hasSkill('juechenjinge')) {
							return 1;
						}
					})
				);
			},
		},
	},
	chiyanzhenhunqin: {
		equipSkill: true,
		trigger: { source: 'damageBegin1' },
		forced: true,
		content() {
			game.setNature(trigger, 'fire');
		},
	},
	longfenghemingjian: {
		equipSkill: true,
		inherit: 'cixiong_skill',
		filter(event, player) {
			return get.natureList(event.card).some((i) => {
				return i === 'thunder' || i === 'fire';
			});
		},
	},
	qicaishenlu: {
		trigger: { source: 'damageBegin1' },
		forced: true,
		filter(event, player) {
			return event.hasNature('linked');
		},
		content() {
			trigger.num++;
		},
	},
	boss_chiyan: {
		trigger: { global: 'gameStart' },
		forced: true,
		popup: false,
		fixed: true,
		content() {
			player.smoothAvatar();
			player.init('boss_zhuque');
			_status.noswap = true;
			game.addVideo('reinit2', player, player.name);
		},
	},
	boss_chiyan2: {
		mode: ['boss'],
		global: 'boss_chiyan2x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		filter(event, player) {
			return player == game.boss;
		},
		content() {
			player.hide();
			game.addVideo('hidePlayer', player);
		},
	},
	boss_chiyan2x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_chiyan2');
		},
		content() {
			'step 0';
			('step 1');
			if (game.me != game.boss) {
				game.boss.changeSeat(6);
			} else {
				game.boss.nextSeat.changeSeat(3);
				game.boss.previousSeat.changeSeat(5);
			}
			game.changeBoss('boss_huoshenzhurong');
			for (const i of game.players) {
				i.hp = i.maxHp;
				i.update();
			}
			('step 2');
			game.addBossFellow(game.me == game.boss ? 1 : 5, 'boss_yanling');
			game.addBossFellow(7, 'boss_yanling');
			('step 3');
			var dnum = 0;
			var dead = game.dead.slice(0);
			for (let i = 0; i < dead.length; i++) {
				if (!dead[i].side && dead[i].maxHp > 0 && dead[i].parentNode == player.parentNode) {
					dead[i].revive(dead[i].maxHp);
					dnum++;
				}
			}
			for (const i of game.players) {
				if (i.side) {
					continue;
				}
				i.removeEquipTrigger();
				var hej = i.getCards('hej');
				for (var j = 0; j < hej.length; j++) {
					hej[j].discard(false);
				}
				i.hp = i.maxHp;
				i.hujia = 0;
				i.classList.remove('turnedover');
				i.removeLink();
				i.directgain(get.cards(4 - dnum));
			}
			('step 4');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = game.boss;
			_status.event.step = 0;
			_status.roundStart = game.boss;
			game.phaseNumber = 0;
			game.roundNumber = 0;
			if (game.bossinfo) {
				game.bossinfo.loopType = 1;
			}
		},
	},
	boss_chiyan3: {
		mode: ['boss'],
		global: 'boss_chiyan3x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		filter(event, player) {
			return player == game.boss;
		},
		content() {
			player.hide();
			player.nextSeat.hide();
			player.previousSeat.hide();
			game.addVideo('hidePlayer', player);
			game.addVideo('hidePlayer', player.nextSeat);
			game.addVideo('hidePlayer', player.previousSeat);
		},
	},
	boss_chiyan3x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_chiyan3');
		},
		content() {
			'step 0';
			('step 1');
			game.changeBoss('boss_yandi');
			('step 2');
			game.changeBoss('boss_huoshenzhurong', game.boss.previousSeat);
			game.changeBoss('boss_yanling', game.boss.nextSeat);
			('step 3');
			var dnum = 0;
			var dead = game.dead.slice(0);
			for (let i = 0; i < dead.length; i++) {
				if (!dead[i].side && dead[i].maxHp > 0 && dead[i].parentNode == player.parentNode) {
					dead[i].revive(dead[i].maxHp);
					dnum++;
				}
			}
			for (const i of game.players) {
				if (i.side) {
					continue;
				}
				i.removeEquipTrigger();
				var hej = i.getCards('hej');
				for (var j = 0; j < hej.length; j++) {
					hej[j].discard(false);
				}
				i.hp = i.maxHp;
				i.hujia = 0;
				i.classList.remove('turnedover');
				i.removeLink();
				i.directgain(get.cards(4 - dnum));
			}
			('step 4');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = game.boss;
			_status.event.step = 0;
			_status.roundStart = game.boss;
			game.phaseNumber = 0;
			game.roundNumber = 0;
		},
	},
	boss_qingmu: {
		trigger: { global: 'gameStart' },
		forced: true,
		popup: false,
		fixed: true,
		content() {
			player.smoothAvatar();
			player.init('boss_qinglong');
			_status.noswap = true;
			game.addVideo('reinit2', player, player.name);
		},
	},
	boss_qingmu2: {
		mode: ['boss'],
		global: 'boss_qingmu2x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		filter(event, player) {
			return player == game.boss;
		},
		content() {
			player.hide();
			game.addVideo('hidePlayer', player);
		},
	},
	boss_qingmu2x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_qingmu2');
		},
		content() {
			'step 0';
			('step 1');
			if (game.me != game.boss) {
				game.boss.changeSeat(6);
			} else {
				game.boss.nextSeat.changeSeat(3);
				game.boss.previousSeat.changeSeat(5);
			}
			game.changeBoss('boss_mushengoumang');
			for (const i of game.players) {
				i.hp = i.maxHp;
				i.update();
			}
			('step 2');
			game.addBossFellow(game.me == game.boss ? 1 : 5, 'boss_shujing');
			game.addBossFellow(7, 'boss_shujing');
			('step 3');
			var dnum = 0;
			var dead = game.dead.slice(0);
			for (let i = 0; i < dead.length; i++) {
				if (!dead[i].side && dead[i].maxHp > 0 && dead[i].parentNode == player.parentNode) {
					dead[i].revive(dead[i].maxHp);
					dnum++;
				}
			}
			for (const i of game.players) {
				if (i.side) {
					continue;
				}
				i.removeEquipTrigger();
				var hej = i.getCards('hej');
				for (var j = 0; j < hej.length; j++) {
					hej[j].discard(false);
				}
				i.hp = i.maxHp;
				i.hujia = 0;
				i.classList.remove('turnedover');
				i.removeLink();
				i.directgain(get.cards(4 - dnum));
			}
			('step 4');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = game.boss;
			_status.event.step = 0;
			_status.roundStart = game.boss;
			game.phaseNumber = 0;
			game.roundNumber = 0;
			if (game.bossinfo) {
				game.bossinfo.loopType = 1;
			}
		},
	},
	boss_qingmu3: {
		mode: ['boss'],
		global: 'boss_qingmu3x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		filter(event, player) {
			return player == game.boss;
		},
		content() {
			player.hide();
			player.nextSeat.hide();
			player.previousSeat.hide();
			game.addVideo('hidePlayer', player);
			game.addVideo('hidePlayer', player.nextSeat);
			game.addVideo('hidePlayer', player.previousSeat);
		},
	},
	boss_qingmu3x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_qingmu3');
		},
		content() {
			'step 0';
			('step 1');
			game.changeBoss('boss_taihao');
			('step 2');
			game.changeBoss('boss_mushengoumang', game.boss.previousSeat);
			game.changeBoss('boss_shujing', game.boss.nextSeat);
			('step 3');
			var dnum = 0;
			var dead = game.dead.slice(0);
			for (let i = 0; i < dead.length; i++) {
				if (!dead[i].side && dead[i].maxHp > 0 && dead[i].parentNode == player.parentNode) {
					dead[i].revive(dead[i].maxHp);
					dnum++;
				}
			}
			for (const i of game.players) {
				if (i.side) {
					continue;
				}
				i.removeEquipTrigger();
				var hej = i.getCards('hej');
				for (var j = 0; j < hej.length; j++) {
					hej[j].discard(false);
				}
				i.hp = i.maxHp;
				i.hujia = 0;
				i.classList.remove('turnedover');
				i.removeLink();
				i.directgain(get.cards(4 - dnum));
			}
			('step 4');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = game.boss;
			_status.event.step = 0;
			_status.roundStart = game.boss;
			game.phaseNumber = 0;
			game.roundNumber = 0;
		},
	},
	boss_xuanlin: {
		trigger: { global: 'gameStart' },
		forced: true,
		popup: false,
		fixed: true,
		content() {
			player.smoothAvatar();
			player.init('boss_xuanwu');
			_status.noswap = true;
			game.addVideo('reinit2', player, player.name);
		},
	},
	boss_xuanlin2: {
		mode: ['boss'],
		global: 'boss_xuanlin2x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		filter(event, player) {
			return player == game.boss;
		},
		content() {
			player.hide();
			game.addVideo('hidePlayer', player);
		},
	},
	boss_xuanlin2x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_xuanlin2');
		},
		content() {
			'step 0';
			('step 1');
			if (game.me != game.boss) {
				game.boss.changeSeat(6);
			} else {
				game.boss.nextSeat.changeSeat(3);
				game.boss.previousSeat.changeSeat(5);
			}
			game.changeBoss('boss_shuishengonggong');
			for (const i of game.players) {
				i.hp = i.maxHp;
				i.update();
			}
			('step 2');
			game.addBossFellow(game.me == game.boss ? 1 : 7, 'boss_shuishenxuanming');
			('step 3');
			var dnum = 0;
			var dead = game.dead.slice(0);
			for (let i = 0; i < dead.length; i++) {
				if (!dead[i].side && dead[i].maxHp > 0 && dead[i].parentNode == player.parentNode) {
					dead[i].revive(dead[i].maxHp);
					dnum++;
				}
			}
			for (const i of game.players) {
				if (i.side) {
					continue;
				}
				i.removeEquipTrigger();
				var hej = i.getCards('hej');
				for (var j = 0; j < hej.length; j++) {
					hej[j].discard(false);
				}
				i.hp = i.maxHp;
				i.hujia = 0;
				i.classList.remove('turnedover');
				i.removeLink();
				i.directgain(get.cards(4 - dnum));
			}
			('step 4');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = game.boss;
			_status.event.step = 0;
			_status.roundStart = game.boss;
			game.phaseNumber = 0;
			game.roundNumber = 0;
			if (game.bossinfo) {
				game.bossinfo.loopType = 1;
			}
		},
	},
	boss_xuanlin3: {
		mode: ['boss'],
		global: 'boss_xuanlin3x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		filter(event, player) {
			if (game.boss && game.boss.name == 'boss_zhuanxu') {
				return false;
			}
			return true;
		},
		content() {
			player.hide();
			game.addVideo('hidePlayer', player);
			if (player.nextSeat.side == player.side) {
				player.nextSeat.hide();
				game.addVideo('hidePlayer', player.nextSeat);
			}
			if (player.previousSeat.side == player.side) {
				player.previousSeat.hide();
				player.previousSeat.node.handcards1.hide();
				player.previousSeat.node.handcards2.hide();
				game.addVideo('hidePlayer', player.previousSeat);
				game.addVideo('deleteHandcards', player.previousSeat);
			}
		},
	},
	boss_xuanlin3x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			if (game.boss && game.boss.name == 'boss_zhuanxu') {
				return false;
			}
			return event.player.hasSkill('boss_xuanlin3');
		},
		content() {
			'step 0';
			('step 1');
			game.changeBoss('boss_zhuanxu');
			('step 2');
			game.addBossFellow(game.me == game.boss ? 7 : 5, 'boss_shuishengonggong');
			game.changeBoss('boss_shuishenxuanming', game.boss.nextSeat);
			game.boss.previousSeat.maxHp--;
			game.boss.previousSeat.update();
			game.boss.nextSeat.maxHp--;
			game.boss.nextSeat.update();
			('step 3');
			var dnum = 0;
			var dead = game.dead.slice(0);
			for (let i = 0; i < dead.length; i++) {
				if (!dead[i].side && dead[i].maxHp > 0 && dead[i].parentNode == player.parentNode) {
					dead[i].revive(dead[i].maxHp);
					dnum++;
				}
			}
			for (const i of game.players) {
				if (i.side) {
					continue;
				}
				i.removeEquipTrigger();
				var hej = i.getCards('hej');
				for (var j = 0; j < hej.length; j++) {
					hej[j].discard(false);
				}
				i.hp = i.maxHp;
				i.hujia = 0;
				i.classList.remove('turnedover');
				i.removeLink();
				i.directgain(get.cards(4 - dnum));
			}
			('step 4');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = game.boss;
			_status.event.step = 0;
			_status.roundStart = game.boss;
			game.phaseNumber = 0;
			game.roundNumber = 0;
		},
	},
	boss_baimang: {
		trigger: { global: 'gameStart' },
		forced: true,
		popup: false,
		fixed: true,
		content() {
			player.smoothAvatar();
			player.init('boss_baihu');
			_status.noswap = true;
			game.addVideo('reinit2', player, player.name);
		},
	},
	boss_baimang2: {
		mode: ['boss'],
		global: 'boss_baimang2x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		filter(event, player) {
			return player == game.boss;
		},
		content() {
			player.hide();
			game.addVideo('hidePlayer', player);
		},
	},
	boss_baimang2x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_baimang2');
		},
		content() {
			'step 0';
			('step 1');
			if (game.me != game.boss) {
				game.boss.changeSeat(6);
			} else {
				game.boss.nextSeat.changeSeat(3);
				game.boss.previousSeat.changeSeat(5);
			}
			game.changeBoss('boss_jinshenrushou');
			for (const i of game.players) {
				i.hp = i.maxHp;
				i.update();
			}
			('step 2');
			game.addBossFellow(game.me == game.boss ? 1 : 5, 'boss_mingxingzhu');
			game.addBossFellow(7, 'boss_mingxingzhu');
			('step 3');
			var dnum = 0;
			var dead = game.dead.slice(0);
			for (let i = 0; i < dead.length; i++) {
				if (!dead[i].side && dead[i].maxHp > 0 && dead[i].parentNode == player.parentNode) {
					dead[i].revive(dead[i].maxHp);
					dnum++;
				}
			}
			for (const i of game.players) {
				if (i.side) {
					continue;
				}
				i.removeEquipTrigger();
				var hej = i.getCards('hej');
				for (var j = 0; j < hej.length; j++) {
					hej[j].discard(false);
				}
				i.hp = i.maxHp;
				i.hujia = 0;
				i.classList.remove('turnedover');
				i.removeLink();
				i.directgain(get.cards(4 - dnum));
			}
			('step 4');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = game.boss;
			_status.event.step = 0;
			_status.roundStart = game.boss;
			game.phaseNumber = 0;
			game.roundNumber = 0;
			if (game.bossinfo) {
				game.bossinfo.loopType = 1;
			}
		},
	},
	boss_baimang3: {
		mode: ['boss'],
		global: 'boss_baimang3x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		filter(event, player) {
			return player == game.boss;
		},
		content() {
			player.hide();
			player.nextSeat.hide();
			player.previousSeat.hide();
			game.addVideo('hidePlayer', player);
			game.addVideo('hidePlayer', player.nextSeat);
			game.addVideo('hidePlayer', player.previousSeat);
		},
	},
	boss_baimang3x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_baimang3');
		},
		content() {
			'step 0';
			('step 1');
			game.changeBoss('boss_shaohao');
			('step 2');
			game.changeBoss('boss_jinshenrushou', game.boss.previousSeat);
			game.changeBoss('boss_mingxingzhu', game.boss.nextSeat);
			game.boss.previousSeat.maxHp--;
			game.boss.previousSeat.update();
			if (game.me != game.boss) {
				game.addBossFellow(4, 'boss_mingxingzhu');
			} else {
				// ui.arena.dataset.number='7';
				// game.addVideo('arenaNumber',null,7);
				// game.boss.previousSeat.changeSeat(6);
				// game.boss.nextSeat.nextSeat.changeSeat(2);
				// game.boss.nextSeat.nextSeat.nextSeat.changeSeat(3);
				// game.boss.nextSeat.nextSeat.nextSeat.nextSeat.changeSeat(4);
				game.addBossFellow(6, 'boss_mingxingzhu');
			}
			('step 3');
			var dnum = 0;
			var dead = game.dead.slice(0);
			for (let i = 0; i < dead.length; i++) {
				if (!dead[i].side && dead[i].maxHp > 0 && dead[i].parentNode == player.parentNode) {
					dead[i].revive(dead[i].maxHp);
					dnum++;
				}
			}
			for (const i of game.players) {
				if (i.side) {
					continue;
				}
				i.removeEquipTrigger();
				var hej = i.getCards('hej');
				for (var j = 0; j < hej.length; j++) {
					hej[j].discard(false);
				}
				i.hp = i.maxHp;
				i.hujia = 0;
				i.classList.remove('turnedover');
				i.removeLink();
				i.directgain(get.cards(4 - dnum));
			}
			('step 4');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = game.boss;
			_status.event.step = 0;
			_status.roundStart = game.boss;
			game.phaseNumber = 0;
			game.roundNumber = 0;
		},
	},
	boss_shenyi: {
		mod: {
			judge(player, result) {
				if (_status.event.type == 'phase') {
					if (result.bool == false) {
						result.bool = null;
					} else {
						result.bool = false;
					}
				}
			},
		},
		trigger: { player: 'turnOverBefore' },
		_priority: 20,
		forced: true,
		filter(event, player) {
			return !player.isTurnedOver();
		},
		content() {
			trigger.cancel();
			game.log(player, '取消了翻面');
		},
		ai: {
			noturn: true,
			effect: {
				target(card, player, target) {
					if (get.type(card) == 'delay') {
						return 0.5;
					}
				},
			},
		},
	},
	honghuangzhili: {
		init(player) {
			player.disableSkill('honghuangzhili', 'boss_shenyi');
		},
		mark: true,
		nopop: true,
		intro: {
			content: '【神裔】无效直到下家的回合开始',
		},
		marktext: '荒',
		onremove(player) {
			player.enableSkill('honghuangzhili', 'boss_shenyi');
		},
		trigger: { global: 'phaseZhunbeiBegin' },
		forced: true,
		popup: false,
		filter(event, player) {
			return event.player == player.next;
		},
		content() {
			player.removeSkill('honghuangzhili');
		},
	},
	boss_shenen: {
		mode: ['boss'],
		global: 'boss_shenen2',
	},
	boss_shenen2: {
		mod: {
			targetInRange(card, player) {
				if (player.side) {
					return true;
				}
			},
			maxHandcard(player, num) {
				if (!player.side) {
					return num + 1;
				}
			},
		},
		trigger: { player: 'phaseDrawBegin' },
		forced: true,
		sourceSkill: 'boss_shenen',
		filter(event, player) {
			return !player.side;
		},
		content() {
			trigger.num++;
		},
	},
	boss_fentian: {
		trigger: { source: 'damageBegin1' },
		forced: true,
		filter(event, player) {
			return !event.hasNature('fire');
		},
		content() {
			trigger.hasNature('fire');
		},
		mod: {
			cardUsable(card) {
				if (get.color(card) == 'red') {
					return Infinity;
				}
			},
			targetInRange(card) {
				if (get.color(card) == 'red') {
					return true;
				}
			},
			wuxieRespondable(card, player, target) {
				if (get.color(card) == 'red' && player != target) {
					return false;
				}
			},
		},
		group: 'boss_fentian2',
	},
	boss_fentian2: {
		trigger: { player: 'useCard' },
		forced: true,
		sourceSkill: 'boss_fentian',
		filter(event, player) {
			return get.color(event.card) == 'red';
		},
		content() {
			trigger.directHit.addArray(game.players);
			trigger.directHit.remove(player);
		},
	},
	boss_xingxia: {
		enable: 'phaseUse',
		mode: ['boss'],
		filter(event, player) {
			if (
				!game.hasPlayer(function (current) {
					return current.name == 'boss_yanling';
				})
			) {
				return false;
			}
			return !player.storage.boss_xingxia || game.roundNumber - player.storage.boss_xingxia >= 2;
		},
		filterTarget(card, player, target) {
			return target.name == 'boss_yanling';
		},
		selectTarget: -1,
		line: 'fire',
		content() {
			target.damage(2, 'fire');
		},
		contentAfter() {
			'step 0';
			player.storage.boss_xingxia = game.roundNumber;
			player.chooseTarget(function (card, player, target) {
				return target.side != player.side;
			}).ai = function (target) {
				return get.damageEffect(target, player, player, 'fire');
			};
			('step 1');
			if (result.bool) {
				event.target = result.targets[0];
				player.line(event.target, 'fire');
				event.target.chooseToDiscard('he', { color: 'red' }, '弃置一张红色牌或受到1点火焰伤害').ai = function (card) {
					var player = _status.event.player;
					var source = _status.event.parent.player;
					if (get.damageEffect(player, source, player, 'fire') >= 0) {
						return 0;
					}
					return 8 - get.value(card);
				};
			} else {
				event.finish();
			}
			('step 2');
			if (!result.bool) {
				event.target.damage('fire');
			}
		},
		ai: {
			order: 6,
			result: {
				target(player, target) {
					if (target.isLinked() && player.isLinked() && get.damageEffect(player, player, player, 'fire') < 0) {
						return -1;
					}
					return 1;
				},
			},
		},
	},
	boss_huihuo: {
		global: 'boss_huihuo2',
		mod: {
			cardUsable(card, player, num) {
				if (card.name == 'sha') {
					return num + 1;
				}
			},
		},
		ai: {
			revertsave: true,
			effect: {
				target(card, player, target) {
					if (!game.boss) {
						return;
					}
					if (card.name == 'tiesuo') {
						if (_status.event.player == game.boss) {
							return 'zeroplayertarget';
						}
						return 0.5;
					}
					if (get.tag(card, 'damage') || get.tag(card, 'recover')) {
						if (game.boss.isLinked() && get.damageEffect(game.boss, player, game.boss, 'fire') < 0) {
							if (
								game.hasPlayer(function (current) {
									return current.isEnemiesOf(game.boss) && current.isLinked();
								})
							) {
								return;
							}
							if (get.tag(card, 'natureDamage') && target.isLinked()) {
								return;
							}
						}
						if (target.isDying()) {
							if (player.isEnemiesOf(target) && player.hp >= -1) {
								return [0, 0, 0, 1];
							}
							return 'zeroplayertarget';
						}
						return -0.5;
					}
				},
			},
		},
	},
	boss_huihuo2: {
		trigger: { global: 'dieAfter' },
		forced: true,
		sourceSkill: 'boss_huihuo',
		filter(event, player) {
			return event.player.hasSkill('boss_huihuo') && event.player.isDead() && player.isEnemiesOf(event.player);
		},
		content() {
			trigger.player.line(player, 'fire');
			player.damage('nosource', 'fire', 3).animate = false;
			player.$damage(trigger.player);
			player.$damagepop(-3, 'fire');
			if (lib.config.animation && !lib.config.low_performance) {
				player.$fire();
			}
			if (!event.parent.parent.boss_huihuo_logv) {
				event.parent.parent.boss_huihuo_logv = true;
				game.logv(trigger.player, 'boss_huihuo', game.filterPlayer(), event.parent.parent);
			}
		},
	},
	boss_furan: {
		global: 'boss_furan2',
	},
	boss_furan2: {
		enable: 'chooseToUse',
		filter(event, player) {
			return event.type == 'dying' && event.dying.hasSkill('boss_furan') && player.isEnemiesOf(event.dying);
		},
		filterCard(card, player) {
			return get.color(card) == 'red';
		},
		position: 'he',
		viewAs: { name: 'tao' },
		prompt: '将一张红色牌当桃使用',
		sourceSkill: 'boss_furan',
		check(card) {
			return 8 - get.value(card);
		},
		ai: {
			order: 5,
			skillTagFilter(player) {
				var event = _status.event;
				if (event.dying && event.dying.hasSkill('boss_furan') && player.isEnemiesOf(event.dying)) {
					return player.countCards('he', { color: 'red' }) > 0 && _status.currentPhase != player;
				} else {
					return false;
				}
			},
			save: true,
		},
	},
	boss_chiyi: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		filter(event, player) {
			return [3, 5, 7].includes(game.roundNumber);
		},
		content() {
			'step 0';
			if (game.roundNumber == 3) {
				var enemies = game.filterPlayer(function (current) {
					return current.isEnemiesOf(player);
				});
				player.line(enemies, 'green');
				for (let i = 0; i < enemies.length; i++) {
					enemies[i].addSkill('boss_chiyi2');
				}
				event.finish();
			} else if (game.roundNumber == 5) {
				event.targets = game.filterPlayer().sortBySeat();
				event.num = 1;
			} else {
				event.targets = game
					.filterPlayer(function (current) {
						return current.name == 'boss_yanling';
					})
					.sortBySeat();
				event.num = 5;
			}
			('step 1');
			if (event.targets.length) {
				var target = event.targets.shift();
				player.line(target, 'fire');
				target.damage(event.num, 'fire');
				event.redo();
			}
		},
	},
	boss_chiyi2: {
		mark: true,
		marktext: '赤',
		intro: {
			content: '受到的伤害+1',
		},
		trigger: { player: 'damageBegin3' },
		forced: true,
		popup: false,
		sourceSkill: 'boss_chiyi',
		content() {
			trigger.num++;
		},
	},
	boss_buchun: {
		mode: ['boss'],
		group: ['boss_buchun_recover', 'boss_buchun_revive'],
		subSkill: {
			revive: {
				enable: 'phaseUse',
				filter(event, player) {
					if (!player.storage.boss_buchun || game.roundNumber - player.storage.boss_buchun >= 2) {
						for (let i = 0; i < game.dead.length; i++) {
							if (game.dead[i].parentNode == player.parentNode && game.dead[i].name == 'boss_shujing') {
								return true;
							}
						}
					}
					return false;
				},
				content() {
					'step 0';
					player.loseHp();
					player.storage.boss_buchun = game.roundNumber;
					('step 1');
					event.targets = [];
					var dead = game.dead.slice(0);
					for (let i = 0; i < dead.length; i++) {
						if (dead[i].parentNode == player.parentNode && dead[i].name == 'boss_shujing') {
							event.targets.push(dead[i]);
						}
					}
					if (event.targets[0] == player.previousSeat) {
						event.targets.push(event.targets.shift());
					}
					('step 2');
					if (event.targets.length) {
						var target = event.targets.shift();
						player.line(target, 'green');
						target.revive(1);
						target.draw(2, false);
						target.$draw(2);
						event.redo();
					}
					('step 3');
				},
				ai: {
					order: 6,
					result: {
						player(player, target) {
							if (player.hp <= 1) {
								return 0;
							}
							if (
								player.hp <= 3 &&
								game.hasPlayer(function (current) {
									return current.name == 'boss_shujing' && current.hp == 1;
								})
							) {
								if (_status.event.getRand() < 0.4) {
									return 0;
								}
							}
							if (player.hp >= 3) {
								return 1;
							}
							if (player.hp >= 2 && player != game.boss) {
								return 1;
							}
							if (
								game.hasPlayer(function (current) {
									return current.name == 'boss_shujing';
								})
							) {
								return 0;
							}
							return 1;
						},
					},
				},
			},
			recover: {
				enable: 'phaseUse',
				filter(event, player) {
					if (!player.storage.boss_buchun || game.roundNumber - player.storage.boss_buchun >= 2) {
						for (let i = 0; i < game.dead.length; i++) {
							if (game.dead[i].parentNode == player.parentNode && game.dead[i].name == 'boss_shujing') {
								return false;
							}
						}
						return true;
					}
					return false;
				},
				prompt: '令一名己方角色回复2点体力',
				filterTarget(card, player, target) {
					return target.isFriendsOf(player) && target.isDamaged();
				},
				content() {
					target.recover(2);
					player.storage.boss_buchun = game.roundNumber;
				},
				ai: {
					order: 6,
					result: {
						target(player, target) {
							var num = 1;
							if (target.maxHp - target.hp >= 2) {
								num = 1.5;
							}
							return 1.5 * get.recoverEffect(target, player, target);
						},
					},
				},
			},
		},
	},
	boss_cuidu: {
		trigger: { source: 'damageEnd' },
		forced: true,
		filter(event, player) {
			if (event._notrigger.includes(event.player)) {
				return false;
			}
			return event.player.isIn() && event.player.isEnemiesOf(player) && !event.player.hasSkill('boss_zhongdu');
		},
		logTarget: 'player',
		content() {
			trigger.player.addSkill('boss_zhongdu');
			var boss = game.findPlayer(function (current) {
				return current.name == 'boss_mushengoumang';
			});
			if (boss) {
				boss.draw();
			}
		},
	},
	boss_zhongdu: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		mark: true,
		nopop: true,
		temp: true,
		intro: {
			content: '锁定技,回合开始时,你进行判定,若结果不为♥️️,你受到1点无来源的伤害,若结果不为♠️️,你失去此技能',
		},
		content() {
			'step 0';
			player.judge(function (card) {
				var suit = card.suit;
				if (suit == 'spade') {
					return -1;
				}
				if (suit == 'heart') {
					return 1;
				}
				return 0;
			});
			('step 1');
			if (result.suit != 'heart') {
				player.damage('nosource');
			}
			if (result.suit != 'spade') {
				player.removeSkill('boss_zhongdu');
			}
		},
	},
	boss_qingyi: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		filter(event, player) {
			return [3, 5, 7].includes(game.roundNumber);
		},
		content() {
			'step 0';
			if (game.roundNumber == 7) {
				var goumang, shujing;
				for (const i of game.players) {
					if (i.name == 'boss_mushengoumang') {
						goumang = i;
					}
					if (i.name == 'boss_shujing') {
						shujing = i;
					}
				}
				if (!goumang || !shujing) {
					for (let i = 0; i < game.dead.length; i++) {
						if (game.dead[i].parentNode != player.parentNode) {
							continue;
						}
						if (game.dead[i].name == 'boss_mushengoumang') {
							goumang = game.dead[i];
						}
						if (game.dead[i].name == 'boss_shujing') {
							shujing = game.dead[i];
						}
					}
				}
				event.targets = [];
				if (goumang) {
					event.targets.push(goumang);
				}
				if (shujing) {
					event.targets.push(shujing);
				}
				event.command = 'revive';
			} else if (game.roundNumber == 5) {
				event.targets = game
					.filterPlayer(function (current) {
						return current.isEnemiesOf(player);
					})
					.sortBySeat();
				event.command = 'loseHp';
			} else {
				event.targets = game
					.filterPlayer(function (current) {
						return current.isFriendsOf(player);
					})
					.sortBySeat();
				event.command = 'recover';
			}
			('step 1');
			if (event.targets.length) {
				var target = event.targets.shift();
				player.line(target, 'green');
				if (event.command == 'revive') {
					player.line(target, 'green');
					if (target.isDead()) {
						target.maxHp++;
						target.revive(3);
					} else {
						target.gainMaxHp();
						target.recover(3);
					}
					target.draw(3, false);
					target.$draw(3);
					event.delay = true;
				} else {
					target[event.command]();
				}
				event.redo();
			}
			('step 2');
			if (event.delay) {
			}
		},
	},
	boss_qizuo: {
		trigger: { player: 'useCardAfter' },
		filter(event, player) {
			if (event.parent.name == 'boss_qizuo') {
				return false;
			}
			if (!event.targets || !event.card) {
				return false;
			}
			if (event.card && event.card.name == 'wuxie') {
				return false;
			}
			var type = get.type(event.card);
			if (type != 'trick') {
				return false;
			}
			var card = game.createCard(event.card.name, event.card.suit, event.card.number, event.card.nature);
			var targets = event._targets || event.targets;
			for (let i = 0; i < targets.length; i++) {
				if (!targets[i].isIn()) {
					return false;
				}
				if (!player.canUse({ name: event.card.name }, targets[i], false, false)) {
					return false;
				}
			}
			return true;
		},
		check(event, player) {
			if (event.card.name == 'tiesuo') {
				return false;
			}
			return true;
		},
		content() {
			var card = game.createCard(trigger.card.name, trigger.card.suit, trigger.card.number, trigger.card.nature);
			player.useCard(card, (trigger._targets || trigger.targets).slice(0));
		},
		ai: {
			threaten: 1.3,
		},
	},
	boss_guimou: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			var list = game.filterPlayer(function (target) {
				return target != player && !target.isMad();
			});
			if (list.length) {
				var target = list.randomGet();
				player.line(target, 'green');
				target.goMad({ player: 'phaseAfter' });
			}
		},
	},
	boss_yuance: {
		trigger: { global: 'damageEnd' },
		filter(event, player) {
			return event.source && event.source != event.player && event.source.isAlive() && event.player.isAlive();
		},
		forced: true,
		content() {
			'step 0';
			var att1 = get.attitude(player, trigger.player);
			var att2 = get.attitude(player, trigger.source);
			var targets = player.getEnemies();
			var stop = false;
			for (let i = 0; i < targets.length; i++) {
				var skills = targets[i].getSkills();
				for (var j = 0; j < skills.length; j++) {
					if (get.tag(skills[j], 'rejudge', targets[i])) {
						stop = true;
						break;
					}
				}
			}
			var rand = Math.random() < 0.5 ? '选项一' : '选项二';
			var sourcename = get.translation(trigger.source);
			var playername = get.translation(trigger.player);
			player
				.chooseControl('选项一', '选项二', 'cancel2', function () {
					if (att1 == 0 && att2 == 0) {
						return rand;
					}
					if (att1 * att2 >= 0) {
						if (att1 + att2 > 0) {
							return '选项二';
						} else {
							return '选项一';
						}
					} else {
						if (trigger.player.isHealthy() && trigger.source.isHealthy()) {
							return rand;
						}
						if (trigger.player.isHealthy()) {
							if (att1 < 0) {
								return '选项二';
							}
							if (att1 > 0 && !stop) {
								return '选项一';
							}
						}
						if (trigger.source.isHealthy()) {
							if (att2 < 0) {
								return '选项二';
							}
							if (att2 > 0 && !stop) {
								return '选项一';
							}
						}
						if (stop) {
							return 'cancel2';
						}
						return rand;
					}
				})
				.set('prompt', get.prompt('boss_yuance'))
				.set('choiceList', ['若判定结果为黑色,' + playername + '失去1点体力,否则' + sourcename + '失去1点体力', '若判定结果为红色,' + playername + '回复1点体力,否则' + sourcename + '回复1点体力']);
			('step 1');
			var att1 = get.attitude(player, trigger.player);
			var att2 = get.attitude(player, trigger.source);
			if (result.control == '选项一') {
				event.type = 1;
				player.judge(function (card) {
					if (get.color(card) == 'black') {
						if (att1 > 0) {
							return -1;
						}
						if (att1 < 0) {
							return 1;
						}
					} else {
						if (att2 > 0) {
							return -1;
						}
						if (att2 < 0) {
							return 1;
						}
					}
					return 0;
				});
			} else if (result.control == '选项二') {
				event.type = 2;
				player.judge(function (card) {
					if (get.color(card) == 'red') {
						if (trigger.player.isDamaged()) {
							if (att1 > 0) {
								return 1;
							}
							if (att1 < 0) {
								return -1;
							}
						}
					} else {
						if (trigger.source.isDamaged()) {
							if (att2 > 0) {
								return 1;
							}
							if (att2 < 0) {
								return -1;
							}
						}
					}
					return 0;
				});
			} else {
				event.finish();
			}
			('step 2');
			if (event.type == 1) {
				if (result.color == 'black') {
					trigger.player.loseHp();
				} else {
					trigger.source.loseHp();
				}
			} else {
				if (result.color == 'red') {
					trigger.player.recover();
				} else {
					trigger.source.recover();
				}
			}
		},
	},
	boss_guixin: {
		trigger: { global: 'drawAfter' },
		forced: true,
		logTarget: 'player',
		filter(event, player) {
			return event.result && event.result.length >= 2 && event.player != player;
		},
		content() {
			'step 0';
			trigger.player.chooseCard(
				function (card) {
					return trigger.result.includes(card);
				},
				'归心:交给' + get.translation(player) + '一张牌',
				true,
			);
			('step 1');
			if (result.bool) {
				player.gain(result.cards, trigger.player);
				trigger.player.$give(1, player);
			}
		},
	},
	xiongcai: {
		trigger: { player: 'phaseAfter' },
		forced: true,
		init(player) {
			player.storage.xiongcai = [];
			// player.storage.xiongcai2=0;
		},
		intro: {
			content: 'characters',
		},
		content() {
			'step 0';
			// if(player.storage.xiongcai2<1){
			//		player.storage.xiongcai2++;
			//		event.finish();
			// }
			// else{
			//		player.storage.xiongcai2=0;
			// }
			'step 1';
			var list = [];
			var list2 = [];
			var players = game.players.concat(game.dead);
			for (let i = 0; i < players.length; i++) {
				list2.add(players[i].name);
				list2.add(players[i].name1);
				list2.add(players[i].name2);
			}
			for (var i in lib.character) {
				if (lib.character[i][1] != 'wei') {
					continue;
				}
				if (lib.character[i].isBoss) {
					continue;
				}
				if (lib.character[i].isMinskin) {
					continue;
				}
				if (player.storage.xiongcai.includes(i)) {
					continue;
				}
				if (list2.includes(i)) {
					continue;
				}
				list.push(i);
			}
			var name = list.randomGet();
			player.storage.xiongcai.push(name);
			player.markSkill('xiongcai');
			var skills = lib.character[name][3];
			for (let i = 0; i < skills.length; i++) {
				player.addSkill(skills[i]);
			}
			event.dialog = ui.create.dialog('<div class="text center">' + get.translation(player) + '发动了【雄才】', [[name], 'character']);
			('step 2');
			event.dialog.close();
		},
	},
	xiaoxiong: {
		trigger: { global: 'useCardAfter' },
		forced: true,
		filter(event, player) {
			var type = get.type(event.card, 'trick');
			return event.player != player && (type == 'basic' || type == 'trick');
		},
		content() {
			player.gain(game.createCard(trigger.card), 'gain2');
		},
		group: 'xiaoxiong_damage',
		subSkill: {
			damage: {
				trigger: { global: 'phaseJieshuBegin' },
				forced: true,
				filter(event, player) {
					return event.player != player && event.player.countUsed() == 0;
				},
				logTarget: 'player',
				content() {
					trigger.player.damage();
				},
			},
		},
	},
	boss_zhangwu: {
		global: 'boss_zhangwu_ai',
		trigger: { player: 'damageEnd' },
		check(event, player) {
			return event.source && event.source.isIn() && get.damageEffect(event.source, player, player) > 0;
		},
		filter(event, player) {
			return event.source && event.source.isAlive();
		},
		forced: true,
		logTarget: 'source',
		content() {
			'step 0';
			player.chooseToDiscard(get.prompt('boss_zhangwu', trigger.source), 'he', [1, Infinity]).set('ai', function (card) {
				if (get.attitude(player, target) < 0) {
					return 8 - get.value(card);
				}
				return 0;
			});
			('step 1');
			if (result.bool) {
				var num = result.cards.length;
				var cnum = get.cnNumber(num);
				event.num = num;
				trigger.source.chooseToDiscard('he', '章武:弃置' + cnum + '张牌,或取消并受到' + cnum + '点伤害', num).set('ai', function (card) {
					if (!trigger.source.hasSkillTag('nodamage')) {
						return 10 - get.value(card);
					}
					return 0;
				});
			} else {
				event.finish();
			}
			('step 2');
			if (!result.bool) {
				trigger.source.damage(event.num);
			}
		},
		ai: {
			maixie: true,
			maixie_hp: true,
			effect: {
				target(card, player, target) {
					if (get.tag(card, 'damage') && get.attitude(target, player) < 0 && player.countCards('he') < target.countCards('he')) {
						return [0, 2];
					}
				},
			},
		},
	},
	boss_zhangwu_ai: {
		ai: {
			effect: {
				target_use(card, player, target) {
					if (get.tag(card, 'recover') && card.name != 'recover') {
						for (const i of game.players) {
							if (i.hasSkill('xiaoxiong') && get.attitude(target, i) < 0) {
								return 'zeroplayertarget';
							}
						}
					}
				},
			},
		},
	},
	yueyin: {
		mark: true,
		intro: {
			content(storage, player) {
				var str = '扣减' + (7 - player.storage.xiangxing_count) + '点体力后失去下一枚星;';
				str += '防止禳星伤害条件:' + lib.translate['xiangxing' + player.storage.xiangxing + '_info'];
				return str;
			},
			markcount(storage, player) {
				return Math.max(0, 7 - player.storage.xiangxing_count);
			},
		},
		skipDamage: {
			x7(player) {
				return player.countCards('h') == 0;
			},
			x6(player, event) {
				if (event.hasNature) {
					return event.hasNature('fire');
				}
			},
			x5(player, event) {
				if (event.hasNature) {
					return event.hasNature('thunder');
				}
			},
			x4(player, event) {
				return event.name == 'loseHp';
			},
			x3(player, event) {
				return game.hasPlayer(function (current) {
					return current != player && current.countCards('e') >= 4;
				});
			},
			x2(player) {
				return player.countCards('j') >= 2;
			},
			x1() {
				return game.players.length == 2;
			},
		},
		ai: {
			combo: 'xiangxing',
			neg: true,
			effect: {
				target(card, player, target) {
					if (!target.hasSkill('xiangxing') || !target.storage.xiangxing || target.storage.xiangxing_count < 6) {
						return;
					}
					switch (target.storage.xiangxing) {
						case 7:
							if (get.tag(card, 'discard') || get.tag(card, 'lose')) {
								if (player !== target) {
									return [1, 0, 1, 6 / (1 + target.countCards('h'))];
								}
							}
							if (get.tag(card, 'damage') || get.tag(card, 'losehp')) {
								if (target.countCards('h')) {
									return [1, 7, 1, -7];
								}
							}
							break;
						case 6:
							if (typeof card === 'object' && game.hasNature(card, 'fire')) {
								return;
							}
							if (get.tag(card, 'damage') || get.tag(card, 'losehp')) {
								return [1, 6, 1, -6];
							}
							break;
						case 5:
							if (typeof card !== 'object' || game.hasNature(card, 'thunder')) {
								return;
							}
							if (get.tag(card, 'damage') || get.tag(card, 'losehp')) {
								return [1, 5, 1, -5];
							}
							break;
						case 4:
							if (get.tag(card, 'damage')) {
								return [1, 2, 1, -2];
							}
							if (get.tag(card, 'losehp')) {
								return [1, -4];
							}
							break;
						case 3:
							if (get.tag(card, 'damage') || get.tag(card, 'losehp')) {
								if (
									!game.hasPlayer((current) => {
										return current !== target && current.countCards('e') >= 4;
									})
								) {
									return [1, 3, 1, -3];
								}
							}
							break;
						case 2:
							if (typeof card === 'object' && get.type(card) === 'delay') {
								if (target.countCards('j')) {
									return [1, -4];
								}
							}
							if (get.tag(card, 'damage') || get.tag(card, 'losehp')) {
								if (target.countCards('j') <= 2) {
									return [1, 2, 1, -3];
								}
							}
							break;
						case 1:
							if (game.players.length !== 2) {
								return [1, 2, 1, -3];
							}
					}
				},
			},
		},
	},
	xiangxing: {
		init(player) {
			player.storage.xiangxing = 7;
			player.storage.xiangxing_count = 0;
			player.addSkill('xiangxing7');
		},
		mark: true,
		intro: {
			content: '当前有#枚星',
		},
		trigger: { player: ['damageEnd', 'loseHpEnd'] },
		forced: true,
		popup: false,
		content() {
			'step 0';
			var num = trigger.num;
			if (num > 0) {
				player.storage.xiangxing_count += num;
			}
			if (player.storage.xiangxing_count >= 7) {
				if (player.hasSkill('yueyin') && lib.skill.yueyin.skipDamage['x' + player.storage.xiangxing](player, trigger)) {
					event.goto(3);
				}
				player.removeSkill('xiangxing' + player.storage.xiangxing);
				player.storage.xiangxing--;
				player.storage.xiangxing_count = 0;

				if (player.storage.xiangxing) {
					player.addSkill('xiangxing' + player.storage.xiangxing);
				} else {
					player.awakenSkill(event.name);
				}
				player.popup('xiangxing');
				game.log(player, '失去了一枚星');
			} else {
				event.finish();
			}
			('step 1');
			var list = game.filterPlayer();
			list.remove(player);
			list.sort(lib.sort.seat);
			var list2 = [];
			for (let i = 0; i < list.length; i++) {
				list2.push(0);
			}
			for (let i = 0; i < 7; i++) {
				list2[Math.floor(Math.random() * list2.length)]++;
			}
			event.list = list;
			event.list2 = list2;
			('step 2');
			if (event.list.length) {
				var target = event.list.shift();
				target.damage(event.list2.shift(), 'thunder');
				player.line(target, 'thunder');
				event.redo();
			}
			('step 3');
			if (player.storage.xiangxing == 0) {
				player.maxHp = 3;
				player.update();
			}
		},
	},
	fengqi: {
		trigger: { player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'] },
		forced: true,
		content() {
			'step 0';
			var list = { basic: [], equip: [], trick: [], delay: [] };
			for (let i = 0; i < lib.inpile.length; i++) {
				var name = lib.inpile[i];
				var info = lib.card[name];
				if (info.autoViewAs || name == 'yuansuhuimie') {
					continue;
				}
				if (lib.filter.cardEnabled({ name: name }, player)) {
					if (!list[info.type]) {
						list[info.type] = [];
					}
					list[info.type].push([get.translation(lib.card[name].type), '', name]);
				}
			}
			list.trick.sort(lib.sort.name);
			var dialog = ui.create.dialog('风起', [list.trick, 'vcard']);
			// for(var i in list){
			//		dialog.addText(get.translation(i)+'牌');
			//		dialog.add([list[i],'vcard']);
			// }
			var rand1 = Math.random() < 1 / 3;
			var rand2 = Math.random() < 0.5;
			var rand3 = Math.random() < 1 / 3;
			var rand4 = Math.random() < 1 / 3;
			player.chooseButton(dialog).ai = function (button) {
				var name = button.link[2];
				if (player.hp <= 1) {
					switch (name) {
						case 'zhiliaobo':
							return 1;
						case 'dunpaigedang':
							return 0.8;
						case 'nanman':
							return 0.5;
						default:
							return 0;
					}
				}
				if (rand4 && player.countCards('h') <= 1) {
					switch (name) {
						case 'zengbin':
							return 1;
						case 'wuzhong':
							return 0.8;
						default:
							return 0;
					}
				}
				if (player.hasSkill('qinglonglingzhu')) {
					if (rand2) {
						return name == 'chiyuxi' ? 0.8 : 0;
					}
					return name == 'jingleishan' ? 0.8 : 0;
				}
				if (rand2) {
					return name == 'wanjian' ? 0.8 : 0;
				}
				return name == 'nanman' ? 0.8 : 0;
			};
			('step 1');
			if (result.bool) {
				player.chooseUseTarget(result.links[0][2], true, false);
			}
		},
		ai: {
			threaten: 3,
		},
	},
	gaiming: {
		trigger: { player: 'judgeBefore' },
		forced: true,
		_priority: 1,
		content() {
			'step 0';
			event.cards = get.cards(7);
			player.chooseCardButton(true, event.cards, '改命:选择一张牌作为你的' + trigger.judgestr + '判定结果').ai = function (button) {
				if (get.attitude(player, trigger.player) > 0) {
					return 1 + trigger.judge(button.link);
				}
				if (get.attitude(player, trigger.player) < 0) {
					return 1 - trigger.judge(button.link);
				}
				return 0;
			};
			('step 1');
			if (!result.bool) {
				event.finish();
				return;
			}
			var card = result.links[0];
			event.cards.remove(card);
			var judgestr = get.translation(trigger.player) + '的' + trigger.judgestr + '判定';
			event.videoId = lib.status.videoId++;
			event.dialog = ui.create.dialog(judgestr);
			event.dialog.classList.add('center');
			event.dialog.videoId = event.videoId;
			game.addVideo('judge1', player, [get.cardInfo(card), judgestr, event.videoId]);
			if (Array.isArray(event.cards))
				for (const i of event.cards) {
					i.discard();
				}
			// var node=card.copy('thrown','center',ui.arena).addTempClass('start');
			var node;
			if (game.chess) {
				node = card.copy('thrown', 'center', ui.arena).addTempClass('start');
			} else {
				node = player.$throwordered(card.copy(), true);
			}
			node.classList.add('thrownhighlight');
			ui.arena.classList.add('thrownhighlight');
			if (card) {
				trigger.cancel();
				trigger.result = {
					card: card,
					judge: trigger.judge(card),
					node: node,
					number: card.number,
					suit: card.suit,
					color: get.color(card),
				};
				if (trigger.result.judge > 0) {
					trigger.result.bool = true;
					trigger.player.popup('改命成功');
				}
				if (trigger.result.judge < 0) {
					trigger.result.bool = false;
					trigger.player.popup('改命失败');
				}
				game.log(trigger.player, '的判定结果为', card);
				trigger.direct = true;
				trigger.position.appendChild(card);
			} else {
				event.finish();
			}
			('step 2');
			ui.arena.classList.remove('thrownhighlight');
			event.dialog.close();
			game.addVideo('judge2', null, event.videoId);
			ui.clear();
			var card = trigger.result.card;
			trigger.position.appendChild(card);
			trigger.result.node.delete();
		},
		ai: {
			effect: {
				target(card, player, target) {
					if (typeof card !== 'object' || get.type(card) !== 'delay') {
						return;
					}
					if (target.storage.xiangxing === 2 && target.storage.xiangxing_count > 4 && target.hasSkill('xiangxing') && target.hasSkill('yueyin')) {
						return;
					}
					return 0.13;
				},
			},
		},
	},
	tiandao: {
		audio: true,
		trigger: { global: 'judge' },
		forced: true,
		filter(event, player) {
			return player.countCards('he') > 0;
		},
		content() {
			'step 0';
			player.chooseCard(get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' + get.translation(trigger.player.judging[0]) + ',' + get.prompt('tiandao'), 'he').ai = function (card) {
				var trigger = _status.event.parent._trigger;
				var player = _status.event.player;
				var result = trigger.judge(card) - trigger.judge(trigger.player.judging[0]);
				var attitude = get.attitude(player, trigger.player);
				if (attitude == 0 || result == 0) {
					return 0;
				}
				if (attitude > 0) {
					return result;
				} else {
					return -result;
				}
			};
			('step 1');
			if (result.bool) {
				player.respond(result.cards, 'highlight');
			} else {
				event.finish();
			}
			('step 2');
			if (result.bool) {
				player.$gain2(trigger.player.judging[0]);
				player.gain(trigger.player.judging[0]);
				trigger.player.judging[0] = result.cards[0];
				trigger.position.appendChild(result.cards[0]);
				game.log(trigger.player, '的判定牌改为', result.cards[0]);
			}
			('step 3');
		},
		ai: {
			tag: {
				rejudge: 1,
			},
			threaten: 1.5,
		},
	},
	lianji: {
		audio: true,
		enable: 'phaseUse',
		usable: 1,
		filterTarget(card, player, target) {
			if (player == target) {
				return false;
			}
			return target.countCards('h') > 0;
		},
		selectTarget: 2,
		multitarget: true,
		multiline: true,
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		prepare: 'throw',
		discard: false,
		filterCard: true,
		check(card) {
			return 6 - get.value(card);
		},
		content() {
			'step 0';
			if (targets[0].countCards('h') && targets[1].countCards('h')) {
				targets[0].chooseToCompare(targets[1]);
			} else {
				event.finish();
			}
			('step 1');
			if (result.bool) {
				targets[0].gain(cards);
				targets[0].$gain2(cards);
				targets[1].damage(targets[0]);
			} else {
				targets[1].gain(cards);
				targets[1].$gain2(cards);
				targets[0].damage(targets[1]);
			}
		},
		ai: {
			expose: 0.3,
			threaten: 2,
			order: 9,
			result: {
				target: -1,
			},
		},
	},
	mazui: {
		audio: true,
		enable: 'phaseUse',
		usable: 1,
		filterCard: { color: 'black' },
		filterTarget(card, player, target) {
			return !target.hasSkill('mazui2');
		},
		check(card) {
			return 6 - get.value(card);
		},
		discard: false,
		prepare: 'give',
		content() {
			target.storage.mazui2 = cards[0];
			target.addSkill('mazui2');
			game.addVideo('storage', target, ['mazui2', get.cardInfo(target.storage.mazui2), 'card']);
		},
		ai: {
			expose: 0.2,
			result: {
				target(player, target) {
					return -target.hp;
				},
			},
			order: 4,
			threaten: 1.2,
		},
	},
	mazui2: {
		trigger: { source: 'damageBegin1' },
		forced: true,
		mark: true,
		sourceSkill: 'mazui',
		intro: {
			content: 'expansion',
			markcount: 'expansion',
		},
		filter(event, player) {
			return event.num > 0;
		},
		content() {
			trigger.num--;
			player.addSkill('mazui3');
			player.removeSkill('mazui2');
		},
		intro: {
			content: 'card',
		},
	},
	mazui3: {
		trigger: { source: ['damageEnd', 'damageZero'] },
		forced: true,
		popup: false,
		sourceSkill: 'mazui',
		content() {
			player.gain(player.storage.mazui2, 'gain2');
			game.log(player, '获得了', player.storage.mazui2);
			player.removeSkill('mazui3');
			delete player.storage.mazui2;
		},
	},
	yunshen: {
		trigger: { player: ['respond', 'useCard'] },
		filter(event, player) {
			return event.card && event.card.name == 'shan';
		},
		forced: true,
		init(player) {
			player.storage.yunshen = 0;
		},
		content() {
			player.storage.yunshen++;
			player.markSkill('yunshen');
		},
		ai: {
			effect: {
				target_use(card, player, target) {
					if (get.tag(card, 'respondShan')) {
						var shans = target.countCards('h', 'shan');
						var hs = target.countCards('h');
						if (shans > 1) {
							return [1, 1];
						}
						if (shans && hs > 2) {
							return [1, 1];
						}
						if (shans) {
							return [1, 0.5];
						}
						if (hs > 2) {
							return [1, 0.3];
						}
						if (hs > 1) {
							return [1, 0.2];
						}
						return [1.2, 0];
					}
				},
			},
			threaten: 0.8,
		},
		intro: {
			content: 'mark',
		},
		group: 'yunshen2',
	},
	yunshen2: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		filter(event, player) {
			return player.storage.yunshen > 0;
		},
		content() {
			player.draw(player.storage.yunshen);
			player.storage.yunshen = 0;
			player.unmarkSkill('yunshen');
		},
		mod: {
			globalTo(from, to, distance) {
				if (typeof to.storage.yunshen == 'number') {
					return distance + to.storage.yunshen;
				}
			},
		},
	},
	lingbo: {
		audio: 2,
		trigger: { player: ['respond', 'useCard'] },
		filter(event, player) {
			return event.card && event.card.name == 'shan';
		},
		forced: true,
		content() {
			player.draw(2);
		},
		ai: {
			mingzhi: false,
			effect: {
				target_use(card, player, target) {
					if (get.tag(card, 'respondShan')) {
						var shans = target.countCards('h', 'shan');
						var hs = target.countCards('h');
						if (shans > 1) {
							return [0, 1];
						}
						if (shans && hs > 2) {
							return [0, 1];
						}
						if (shans) {
							return [0, 0];
						}
						if (hs > 2) {
							return [0, 0];
						}
						if (hs > 1) {
							return [1, 0.5];
						}
						return [1.5, 0];
					}
				},
			},
			threaten: 0.8,
		},
	},
	jiaoxia: {
		audio: 2,
		trigger: { target: 'useCardToTargeted' },
		filter(event, player) {
			return event.card && get.color(event.card) == 'red';
		},
		forced: true,
		content() {
			player.draw();
		},
		ai: {
			effect(card, player, target) {
				if (get.color(card) == 'red') {
					return [1, 1];
				}
			},
		},
	},
	boss_nbianshenx: {},
	boss_jingjue: {
		inherit: 'boss_danshu',
	},
	boss_renxing: {
		trigger: { global: ['damageEnd', 'recoverEnd'] },
		forced: true,
		filter(event, player) {
			return _status.currentPhase != player;
		},
		content() {
			player.draw();
		},
	},
	boss_ruizhi: {
		trigger: { global: 'phaseZhunbeiBegin' },
		forced: true,
		filter(event, player) {
			return event.player != player && (event.player.countCards('h') > 1 || event.player.countCards('e') > 1);
		},
		content() {
			'step 0';
			player.line(trigger.player, 'green');
			var next = trigger.player.chooseCard(true, '选择保留一张手牌和一张装备区内的牌,然后弃置其它牌', 'he', function (card) {
				switch (get.position(card)) {
					case 'h': {
						if (ui.selected.cards.length) {
							return get.position(ui.selected.cards[0]) == 'e';
						} else {
							return trigger.player.countCards('h') > 1;
						}
					}
					case 'e': {
						if (ui.selected.cards.length) {
							return get.position(ui.selected.cards[0]) == 'h';
						} else {
							return trigger.player.countCards('e') > 1;
						}
					}
				}
			});
			var num = 0;
			if (trigger.player.countCards('h') > 1) {
				num++;
			}
			if (trigger.player.countCards('e') > 1) {
				num++;
			}
			next.selectCard = [num, num];
			next.ai = function (card) {
				return get.value(card);
			};
			('step 1');
			if (result.bool) {
				var he = [];
				var hs = trigger.player.getCards('h');
				var es = trigger.player.getCards('e');
				if (hs.length > 1) {
					he = he.concat(hs);
				}
				if (es.length > 1) {
					he = he.concat(es);
				}
				if (Array.isArray(result.cards))
					for (const i of result.cards) {
						he.remove(i);
					}
				trigger.player.modedDiscard(he);
			}
		},
	},
	boss_nbaonu: {
		group: ['boss_nbaonu_sha'],
		trigger: { player: 'phaseDrawBegin' },
		forced: true,
		_priority: -1,
		content() {
			if (player.hp > 4) {
				trigger.num = 4 + Math.floor(Math.random() * (player.hp - 3));
			} else {
				trigger.num = 4;
			}
		},
		subSkill: {
			sha: {
				mod: {
					cardUsable(card, player, num) {
						if (card.name == 'sha' && player.hp < 5) {
							return Infinity;
						}
					},
				},
				trigger: { source: 'damageBegin1' },
				filter(event, player) {
					return event.card && event.card.name == 'sha' && event.notLink() && player.hp < 5;
				},
				forced: true,
				content() {
					trigger.num++;
				},
			},
		},
	},
	boss_shouyi: {
		mod: {
			targetInRange() {
				return true;
			},
		},
	},
	boss_mengtai: {
		group: ['boss_mengtai_begin', 'boss_mengtai_draw', 'boss_mengtai_use', 'boss_mengtai_discard', 'boss_mengtai_end'],
		subSkill: {
			begin: {
				trigger: { player: 'phaseZhunbeiBegin' },
				forced: true,
				popup: false,
				content() {
					player.storage.boss_mengtai_draw = true;
					player.storage.boss_mengtai_use = true;
				},
			},
			draw: {
				trigger: { player: 'phaseDrawBegin' },
				forced: true,
				popup: false,
				content() {
					player.storage.boss_mengtai_draw = false;
				},
			},
			use: {
				trigger: { player: 'phaseUseBegin' },
				forced: true,
				popup: false,
				content() {
					player.storage.boss_mengtai_use = false;
				},
			},
			discard: {
				trigger: { player: 'phaseDiscardBefore' },
				forced: true,
				filter(event, player) {
					if (player.storage.boss_mengtai_use) {
						return true;
					}
					return false;
				},
				content() {
					trigger.cancel();
				},
			},
			end: {
				trigger: { player: 'phaseJieshuBegin' },
				forced: true,
				filter(event, player) {
					if (player.storage.boss_mengtai_draw) {
						return true;
					}
					return false;
				},
				content() {
					player.draw(3);
				},
			},
		},
	},
	boss_nbianshen: {
		trigger: { player: 'phaseBefore' },
		forced: true,
		popup: false,
		_priority: 25,
		fixed: true,
		filter(event, player) {
			if (player.name == 'boss_nianshou_heti' || player.storage.boss_nbianshen) {
				return true;
			}
			return false;
		},
		content() {
			if (player.storage.boss_nbianshen) {
				var hp = player.hp,
					maxHp = player.maxHp,
					hujia = player.hujia;
				player.init('boss_nianshou_' + player.storage.boss_nbianshen_next);
				player.storage.boss_nbianshen.remove(player.storage.boss_nbianshen_next);
				if (!player.storage.boss_nbianshen.length) {
					player.storage.boss_nbianshen = ['jingjue', 'renxing', 'ruizhi', 'baonu'];
				}
				player.storage.boss_nbianshen_next = player.storage.boss_nbianshen.randomGet(player.storage.boss_nbianshen_next);
				player.hp = hp;
				player.maxHp = maxHp;
				player.hujia = hujia;
				player.update();
			} else {
				player.storage.boss_nbianshen = ['jingjue', 'renxing', 'ruizhi', 'baonu'];
				player.storage.boss_nbianshen_next = player.storage.boss_nbianshen.randomGet();
				player.markSkill('boss_nbianshen');
			}
		},
		intro: {
			content(storage, player) {
				var map = {
					jingjue: '警觉',
					renxing: '任性',
					ruizhi: '睿智',
					baonu: '暴怒',
				};
				return '下一个状态:' + map[player.storage.boss_nbianshen_next];
			},
		},
	},
	boss_damagecount: {
		mode: ['boss'],
		global: 'boss_damagecount2',
	},
	boss_damagecount2: {
		trigger: { source: 'damageEnd' },
		silent: true,
		filter(event, player) {
			if (!ui.damageCount) {
				return false;
			}
			return event.num > 0 && player.isFriendsOf(game.me) && event.player.isEnemiesOf(game.me);
		},
		content() {
			_status.damageCount += trigger.num;
			ui.damageCount.innerHTML = '伤害: ' + _status.damageCount;
		},
	},
	boss_nianrui: {
		trigger: { player: 'phaseDrawBegin' },
		forced: true,
		content() {
			trigger.num += 2;
		},
		ai: {
			threaten: 1.6,
		},
	},
	boss_qixiang: {
		group: ['boss_qixiang1', 'boss_qixiang2'],
		ai: {
			effect: {
				target(card, player, target, current) {
					if (card.name == 'lebu' || card.name == 'bingliang') {
						return 0.8;
					}
				},
			},
		},
	},
	boss_qixiang1: {
		trigger: { player: 'judge' },
		forced: true,
		filter(event, player) {
			if (event.card) {
				if (event.card.viewAs) {
					return event.card && event.card.viewAs == 'lebu';
				} else {
					return event.card && event.card.name == 'lebu';
				}
			}
		},
		content() {
			player.addTempSkill('boss_qixiang3', 'judgeAfter');
		},
	},
	boss_qixiang2: {
		trigger: { player: 'judge' },
		forced: true,
		filter(event, player) {
			if (event.card) {
				if (event.card.viewAs) {
					return event.card && event.card.viewAs == 'bingliang';
				} else {
					return event.card && event.card.name == 'bingliang';
				}
			}
		},
		content() {
			player.addTempSkill('boss_qixiang4', 'judgeAfter');
		},
	},
	boss_qixiang3: {
		mod: {
			suit(card, suit) {
				if (suit == 'diamond') {
					return 'heart';
				}
			},
		},
	},
	boss_qixiang4: {
		mod: {
			suit(card, suit) {
				if (suit == 'spade') {
					return 'club';
				}
			},
		},
	},
	boss_bianshen2: {
		mode: ['boss'],
		fixed: true,
		global: 'boss_bianshen2x',
		trigger: { player: 'dieBegin' },
		silent: true,
		content() {
			player.hide();
			game.addVideo('hidePlayer', player);
		},
	},
	boss_bianshen2x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_bianshen2');
		},
		content() {
			'step 0';
			('step 1');
			game.changeBoss(['boss_niutou', 'boss_mamian'].randomGet());
		},
	},
	boss_bianshen3: {
		mode: ['boss'],
		global: 'boss_bianshen3x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		content() {
			player.hide();
			game.addVideo('hidePlayer', player);
		},
	},
	boss_bianshen3x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_bianshen3');
		},
		content() {
			'step 0';
			('step 1');
			game.changeBoss(['boss_baiwuchang', 'boss_heiwuchang'].randomGet());
		},
	},
	boss_bianshen4: {
		mode: ['boss'],
		global: 'boss_bianshen4x',
		trigger: { player: 'dieBegin' },
		silent: true,
		fixed: true,
		content() {
			player.hide();
			game.addVideo('hidePlayer', player);
		},
	},
	boss_bianshen4x: {
		trigger: { global: 'dieAfter' },
		forced: true,
		_priority: -10,
		fixed: true,
		filter(event, player) {
			if (lib.config.mode != 'boss') {
				return false;
			}
			return event.player == game.boss && event.player.hasSkill('boss_bianshen4');
		},
		content() {
			'step 0';
			('step 1');
			game.changeBoss(['boss_yecha', 'boss_luocha'].randomGet());
		},
	},
	boss_moyany: {
		trigger: { player: 'loseEnd' },
		forced: true,
		filter(event, player) {
			return _status.currentPhase != player;
		},
		content() {
			'step 0';
			player.judge(function (card) {
				return get.color(card) == 'red' ? 1 : 0;
			});
			('step 1');
			if (result.bool) {
				player.chooseTarget(true, '选择一个目标对其造成两点火焰伤害', function (card, player, target) {
					return player != target;
				}).ai = function (target) {
					return get.damageEffect(target, player, player, 'fire');
				};
			} else {
				event.finish();
			}
			('step 2');
			if (result.targets.length) {
				player.line(result.targets, 'fire');
				result.targets[0].damage(2, 'fire');
			}
		},
		ai: {
			effect: {
				target(card) {
					if (get.tag(card, 'loseCard')) {
						return [0.5, 1];
					}
				},
			},
		},
	},
	boss_danshu: {
		trigger: { player: 'loseEnd' },
		forced: true,
		filter(event, player) {
			return _status.currentPhase != player && player.hp < player.maxHp;
		},
		content() {
			'step 0';
			player.judge(function (card) {
				return get.color(card) == 'red' ? 1 : 0;
			});
			('step 1');
			if (result.color == 'red') {
				player.recover();
			}
		},
		ai: {
			effect: {
				target(card) {
					if (get.tag(card, 'loseCard')) {
						return [0.5, 1];
					}
				},
			},
		},
	},
	boss_modao: {
		audio: true,
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		content() {
			player.draw(2);
		},
	},
	boss_mojian: {
		trigger: { player: 'phaseUseBegin' },
		content() {
			var list = game.filterPlayer(function (current) {
				return player.canUse('wanjian', current) && current.isEnemiesOf(player);
			});
			list.sort(lib.sort.seat);
			player.useCard({ name: 'wanjian' }, list);
		},
		ai: {
			threaten: 1.8,
		},
	},
	boss_yushou: {
		trigger: { player: 'phaseUseBegin' },
		content() {
			var list = game.filterPlayer(function (current) {
				return player.canUse('nanman', current) && current.isEnemiesOf(player);
			});
			list.sort(lib.sort.seat);
			player.useCard({ name: 'nanman' }, list);
		},
	},
	boss_zuijiu: {
		trigger: { source: 'damageBegin1' },
		filter(event, player) {
			return event.card && event.card.name == 'sha' && event.parent.name == 'sha';
		},
		forced: true,
		content() {
			trigger.num++;
		},
	},
	boss_xixing: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_xixing'), function (card, player, target) {
				return player != target && target.isLinked();
			}).ai = function (target) {
				return get.damageEffect(target, player, player, 'thunder');
			};
			('step 1');
			if (result.bool) {
				result.targets[0].damage('thunder');
				player.recover();
			}
		},
	},
	boss_suoming: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current != player && !current.isLinked();
			});
		},
		content() {
			'step 0';
			var num = game.countPlayer(function (current) {
				return current != player && !current.isLinked();
			});
			player.chooseTarget(get.prompt('boss_suoming'), [1, num], function (card, player, target) {
				return !target.isLinked() && player != target;
			}).ai = function (target) {
				return -get.attitude(player, target);
			};
			('step 1');
			if (result.bool) {
				event.targets = result.targets;
				event.num = 0;
			} else {
				event.finish();
			}
			('step 2');
			if (event.num < event.targets.length) {
				event.targets[event.num].link();
				event.num++;
				event.redo();
			}
		},
	},
	boss_taiping: {
		trigger: { player: 'phaseDrawBegin' },
		forced: true,
		content() {
			trigger.num += 2;
		},
	},
	boss_baolian: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			player.draw(2);
		},
	},
	boss_xiaoshou: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_xiaoshou'), function (card, player, target) {
				return player != target && target.hp >= player.hp;
			}).ai = function (target) {
				return get.damageEffect(target, player, player);
			};
			('step 1');
			if (result.bool) {
				result.targets[0].damage(3);
			}
		},
	},
	boss_manjia: {
		group: ['boss_manjia1', 'boss_manjia2'],
	},
	boss_manjia1: {
		trigger: { target: ['useCardToBefore', 'shaBegin'] },
		forced: true,
		_priority: 6,
		sourceSkill: 'boss_manjia',
		filter(event, player, name) {
			if (player.getEquip(2)) {
				return false;
			}
			if (name == 'shaBegin') {
				return lib.skill.tengjia3.filter(event, player);
			}
			return lib.skill.tengjia1.filter(event, player);
		},
		content() {
			trigger.cancel();
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (target.getEquip(2)) {
						return;
					}
					return lib.skill.tengjia1.ai.effect.target.apply(this, arguments);
				},
			},
		},
	},
	boss_manjia2: {
		trigger: { player: 'damageBegin3' },
		sourceSkill: 'boss_manjia',
		filter(event, player) {
			if (player.getEquip(2)) {
				return false;
			}
			if (event.hasNature('fire')) {
				return true;
			}
		},
		forced: true,
		check() {
			return false;
		},
		content() {
			trigger.num++;
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (target.getEquip(2)) {
						return;
					}
					return lib.skill.tengjia2.ai.effect.target.apply(this, arguments);
				},
			},
		},
	},
	boss_lianyu: {
		trigger: { player: 'phaseJieshuBegin' },
		content() {
			'step 0';
			event.players = get.players(player);
			('step 1');
			if (event.players.length) {
				var current = event.players.shift();
				if (current.isEnemiesOf(player)) {
					player.line(current, 'fire');
					current.damage('fire');
				}
				event.redo();
			}
		},
		ai: {
			threaten: 2,
		},
	},
	boss_guiji: {
		trigger: { player: 'phaseJudgeBegin' },
		forced: true,
		content() {
			player.discard(player.getDiscardableCards(player, 'j').randomGet());
		},
		filter(event, player) {
			return player.countDiscardableCards(player, 'j') > 0;
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (get.type(card) == 'delay' && target.countCards('j') == 0) {
						return 0.1;
					}
				},
			},
		},
	},
	boss_minbao: {
		global: 'boss_minbao2',
	},
	boss_minbao2: {
		trigger: { global: 'dieAfter' },
		forced: true,
		sourceSkill: 'boss_minbao',
		filter(event, player) {
			return event.player.hasSkill('boss_minbao') && event.player.isDead();
		},
		content() {
			trigger.player.line(player, 'fire');
			player.damage('nosource', 'fire').animate = false;
			player.$damage(trigger.player);
			player.$damagepop(-1, 'fire');
			if (lib.config.animation && !lib.config.low_performance) {
				player.$fire();
			}
			if (!event.parent.parent.boss_minbao_logv) {
				event.parent.parent.boss_minbao_logv = true;
				game.logv(trigger.player, 'boss_minbao', game.filterPlayer(), event.parent.parent);
			}
		},
	},
	boss_guihuo: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_guihuo'), function (card, player, target) {
				return player != target;
			}).ai = function (target) {
				return get.damageEffect(target, player, player, 'fire');
			};
			('step 1');
			if (result.bool) {
				result.targets[0].damage('fire');
			}
		},
	},
	boss_luolei: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_luolei'), function (card, player, target) {
				return player != target;
			}).ai = function (target) {
				return get.damageEffect(target, player, player, 'thunder');
			};
			('step 1');
			if (result.bool) {
				result.targets[0].damage('thunder');
			}
		},
	},
	boss_beiming: {
		trigger: { player: 'dieBegin' },
		forced: true,
		filter(event, player) {
			return event.source != undefined;
		},
		content() {
			trigger.source.modedDiscard(trigger.source.getCards('h'));
		},
		ai: {
			threaten: 0.7,
		},
	},
	boss_shanbeng: {
		global: 'boss_shanbeng2',
		trigger: { player: 'dieBegin' },
		forced: true,
		logv: false,
		content() {
			var targets = game.filterPlayer(function (current) {
				return current.countCards('e');
			});
			player.line(targets, 'green');
			game.logv(player, 'boss_shanbeng', targets, null, true);
		},
	},
	boss_shanbeng2: {
		trigger: { global: 'dieAfter' },
		forced: true,
		sourceSkill: 'boss_shanbeng',
		filter(event, player) {
			return player.countCards('e') > 0 && event.player.hasSkill('boss_shanbeng') && event.player.isDead();
		},
		content() {
			player.modedDiscard(player.getCards('e'));
		},
	},
	boss_didong: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_didong'), function (card, player, target) {
				return target.isEnemiesOf(player);
			}).ai = function (target) {
				var att = get.attitude(player, target);
				if (target.isTurnedOver()) {
					if (att > 0) {
						return att + 5;
					}
					return -1;
				}
				if (player.isTurnedOver()) {
					return 5 - att;
				}
				return -att;
			};
			('step 1');
			if (result.bool) {
				result.targets[0].turnOver();
			}
		},
		ai: {
			threaten: 1.7,
		},
	},
	boss_guimei: {
		mod: {
			targetEnabled(card, player, target) {
				if (get.type(card) == 'delay') {
					return false;
				}
			},
		},
	},
	boss_bianshen: {
		trigger: { global: 'gameStart' },
		forced: true,
		popup: false,
		content() {
			player.smoothAvatar();
			player.init(['boss_chi', 'boss_mo', 'boss_wang', 'boss_liang'].randomGet());
			game.addVideo('reinit2', player, player.name);
		},
	},
	boss_bianshen_intro1: { nobracket: true },
	boss_bianshen_intro2: { nobracket: true },
	boss_bianshen_intro3: { nobracket: true },
	boss_bianshen_intro4: { nobracket: true },
	boss_chiyan_intro1: { nobracket: true },
	boss_chiyan_intro2: { nobracket: true },
	boss_chiyan_intro3: { nobracket: true },
	boss_chiyan_intro4: { nobracket: true },
	boss_qingmu_intro1: { nobracket: true },
	boss_qingmu_intro2: { nobracket: true },
	boss_qingmu_intro3: { nobracket: true },
	boss_qingmu_intro4: { nobracket: true },
	boss_baimang_intro1: { nobracket: true },
	boss_baimang_intro2: { nobracket: true },
	boss_baimang_intro3: { nobracket: true },
	boss_baimang_intro4: { nobracket: true },
	boss_xuanlin_intro1: { nobracket: true },
	boss_xuanlin_intro2: { nobracket: true },
	boss_xuanlin_intro3: { nobracket: true },
	boss_xuanlin_intro4: { nobracket: true },
	boss_leiji: {
		audio: 2,
		trigger: { player: ['respond', 'useCard'] },
		filter(event, player) {
			return event.card && event.card.name == 'shan';
		},
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_leiji')).ai = function (target) {
				return get.damageEffect(target, player, player, 'thunder');
			};
			('step 1');
			if (result.bool) {
				event.target = result.targets[0];
				event.target.judge(function (card) {
					// var suit=card.suit;
					// if(suit=='spade') return -4;
					// if(suit=='club') return -2;
					if (get.color(card) == 'black') {
						return -2;
					}
					return 0;
				});
			} else {
				event.finish();
			}
			('step 2');
			if (result.bool == false) {
				event.target.damage('thunder');
				player.draw();
			}
		},
		ai: {
			effect: {
				target_use(card, player, target, current) {
					if (get.tag(card, 'respondShan')) {
						var hastarget = false,
							players = game.filterPlayer();
						for (let i = 0; i < players.length; i++) {
							if (get.attitude(target, players[i]) < 0) {
								hastarget = true;
								break;
							}
						}
						var be = target.countCards('e', { color: 'black' });
						if (target.countCards('h', 'shan') && be) {
							if (!target.hasSkill('guidao')) {
								return 0;
							}
							return [0, hastarget ? target.countCards('he') / 2 : 0];
						}
						if (target.countCards('h', 'shan') && target.countCards('h') > 2) {
							if (!target.hasSkill('guidao')) {
								return 0;
							}
							return [0, hastarget ? target.countCards('h') / 4 : 0];
						}
						if (target.countCards('h') > 3 || (be && target.countCards('h') >= 2)) {
							return [0, 0];
						}
						if (target.countCards('h') == 0) {
							return [1.5, 0];
						}
						if (target.countCards('h') == 1 && !be) {
							return [1.2, 0];
						}
						if (!target.hasSkill('guidao')) {
							return [1, 0.05];
						}
						return [1, Math.min(0.5, (target.countCards('h') + be) / 4)];
					}
				},
			},
		},
	},
	wuqin: {
		audio: 2,
		trigger: { player: 'phaseJieshuBegin' },
		filter(event, player) {
			return player.countCards('h') == 0;
		},
		content() {
			player.draw(3);
		},
	},
	boss_baolin: {
		audio: true,
		inherit: 'juece',
	},
	boss_qiangzheng: {
		audio: 2,
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current != player && current.countCards('h');
			});
		},
		content() {
			'step 0';
			var players = get.players(player);
			players.remove(player);
			event.players = players;
			player.line(players, 'green');
			('step 1');
			if (event.players.length) {
				var current = event.players.shift();
				var hs = current.getCards('h');
				if (hs.length) {
					var card = hs.randomGet();
					player.gain(card, current);
					current.$giveAuto(card, player);
				}
				event.redo();
			}
		},
	},
	guizhen: {
		audio: 2,
		trigger: { player: 'loseEnd' },
		forced: true,
		filter(event, player) {
			if (player.countCards('h')) {
				return false;
			}
			if (Array.isArray(event.cards))
				for (const i of event.cards) {
					if (i.original == 'h') {
						return true;
					}
				}
			return false;
		},
		content() {
			'step 0';
			var players = get.players(player);
			players.remove(player);
			event.players = players;
			('step 1');
			if (event.players.length) {
				var current = event.players.shift();
				var hs = current.getCards('h');
				if (hs.length) {
					current.lose(hs)._triggered = null;
					current.$throw(hs);
				} else {
					current.loseHp();
				}
				event.redo();
			}
		},
	},
	boss_konghun: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		filter(event, player) {
			return game.players.length >= 3;
		},
		content() {
			'step 0';
			player.chooseTarget(function (card, player, target) {
				return target != player;
			}).ai = function () {
				return 1;
			};
			('step 1');
			if (result.bool) {
				result.targets[0].goMad();
			}
		},
		group: 'boss_konghun2',
	},
	boss_konghun2: {
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		popup: false,
		sourceSkill: 'boss_konghun',
		content() {
			var players = game.players.concat(game.dead);
			for (let i = 0; i < players.length; i++) {
				if (players[i].isMad()) {
					players[i].unMad();
				}
			}
		},
	},
	yuehun: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			player.recover();
			player.draw(2);
		},
	},
	boss_wange: {
		inherit: 'boss_guiji',
	},
	fengwu: {
		audio: 2,
		enable: 'phaseUse',
		usable: 1,
		content() {
			'step 0';
			event.current = player.next;
			('step 1');
			event.current.chooseToUse({ name: 'sha' }, function (card, player, target) {
				if (player == target) {
					return false;
				}
				if (get.distance(player, target) <= 1) {
					return true;
				}
				var players = game.filterPlayer();
				for (let i = 0; i < players.length; i++) {
					if (players[i] == player) {
						continue;
					}
					if (get.distance(player, players[i]) < get.distance(player, target)) {
						return false;
					}
				}
				return true;
			});
			('step 2');
			if (result.bool == false) {
				event.current.loseHp();
			}
			if (event.current.next != player) {
				event.current = event.current.next;
				event.goto(1);
			}
		},
		ai: {
			order: 1,
			result: {
				player(player) {
					if (player.countCards('h', 'shan')) {
						return 1;
					}
					var num = 0,
						players = game.filterPlayer();
					for (let i = 0; i < players.length; i++) {
						if (players[i].canUse('sha', player) && players[i].countCards('h') > 1) {
							num--;
						} else {
							num++;
						}
					}
					return num;
				},
			},
		},
	},
	huanhua: {
		audio: 2,
		trigger: { global: 'gameDrawAfter' },
		forced: true,
		content() {
			for (const i of game.players) {
				if (i == player) {
					continue;
				}
				player.maxHp += i.maxHp;
				if (!i.name || !lib.character[i.name]) {
					continue;
				}
				var skills = lib.character[i.name][3];
				for (var j = 0; j < skills.length; j++) {
					if (!lib.skill[skills[j]].forceunique) {
						player.addSkill(skills[j]);
					}
				}
			}
			player.hp = player.maxHp;
			player.update();
		},
		group: ['huanhua3', 'huanhua4'],
		ai: {
			threaten: 0.8,
			effect: {
				target(card) {
					if (card.name == 'bingliang') {
						return [0, 0];
					}
				},
			},
		},
	},
	huanhua2: {
		trigger: { player: 'phaseDrawBefore' },
		_priority: 10,
		forced: true,
		popup: false,
		sourceSkill: 'huanhua',
		check() {
			return false;
		},
		content() {
			trigger.cancel();
		},
	},
	huanhua3: {
		trigger: { global: 'drawAfter' },
		forced: true,
		sourceSkill: 'huanhua',
		filter(event, player) {
			if (event.parent.name != 'phaseDraw') {
				return false;
			}
			return event.player != player;
		},
		content() {
			player.draw(trigger.num);
		},
	},
	huanhua4: {
		trigger: { global: 'discardAfter' },
		forced: true,
		sourceSkill: 'huanhua',
		filter(event, player) {
			if (event.parent.parent.name != 'phaseDiscard') {
				return false;
			}
			return event.player != player;
		},
		content() {
			player.chooseToDiscard(trigger.cards.length, true);
		},
	},
	jidian: {
		audio: 2,
		trigger: { source: 'damageAfter' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('jidian'), function (card, player, target) {
				return get.distance(trigger.player, target) <= 1 && trigger.player != target;
			}).ai = function (target) {
				return get.damageEffect(target, player, player, 'thunder') + 0.1;
			};
			('step 1');
			if (result.bool) {
				event.target = result.targets[0];
				event.target.judge(function (card) {
					return get.color(card) == 'red' ? 0 : -1;
				});
				trigger.player.line(event.target, 'thunder');
			} else {
				event.finish();
			}
			('step 2');
			if (result.color == 'black') {
				event.target.damage('thunder');
			}
		},
	},
	tinqin: {
		inherit: 'manjuan',
	},
	boss_hujia: {
		audio: 2,
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		filter(event, player) {
			if (player.hp == player.maxHp) {
				return false;
			}
			if (!player.countCards('he')) {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			player.chooseCardTarget({
				position: 'he',
				filterTarget(card, player, target) {
					if (player == target) {
						return false;
					}
					if (!lib.character[target.name]) {
						return false;
					}
					return true;
				},
				filterCard: lib.filter.cardDiscardable,
				ai1(card) {
					return get.unuseful(card) + 9;
				},
				ai2(target) {
					if (target.storage.boss_hujia) {
						return Math.max(1, 10 - target.maxHp);
					}
					return 1 / target.maxHp;
				},
				prompt: get.prompt('boss_hujia'),
			});
			('step 1');
			if (result.bool) {
				var target = result.targets[0];
				if (target.storage.boss_hujia) {
					target.loseMaxHp();
				} else {
					target.disableSkill('boss_hujia', lib.character[target.name][3]);
					target.storage.boss_hujia = true;
				}
				player.discard(result.cards);
			}
		},
		ai: {
			expose: 0.2,
		},
	},
	boss_guihan: {
		audio: 2,
		enable: 'chooseToUse',
		mark: true,
		derivation: ['tinqin', 'boss_huixin'],
		init(player) {
			player.storage.boss_guihan = false;
		},
		filter(event, player) {
			if (event.type != 'dying') {
				return false;
			}
			if (!player.isDying()) {
				return false;
			}
			if (player.storage.boss_guihan) {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			player.removeSkill('boss_guihan');
			player.hp = player.maxHp;
			player.storage.boss_guihan = true;
			('step 1');
			player.draw(4);
			('step 2');
			for (const i of game.players) {
				i.enableSkill('boss_hujia');
				delete i.storage.boss_hujia;
			}
			if (game.bossinfo) {
				game.bossinfo.loopType = 1;
				_status.roundStart = game.boss;
			}
			player.removeSkill('beige');
			player.removeSkill('boss_hujia');
			player.addSkill('tinqin');
			player.addSkill('boss_huixin');
		},
		ai: {
			skillTagFilter(player) {
				if (player.storage.boss_guihan) {
					return false;
				}
			},
			save: true,
			result: {
				player: 4,
			},
		},
		intro: {
			content: 'limited',
		},
	},
	huoshen: {
		trigger: { player: 'damageBegin1' },
		forced: true,
		filter(event, player) {
			return event.hasNature('fire');
		},
		content() {
			trigger.cancel();
			player.recover();
		},
		ai: {
			effect: {
				target(card) {
					if (get.tag(card, 'fireDamage')) {
						return [0, 2, 0, 0];
					}
				},
			},
		},
	},
	boss_xianyin: {
		trigger: { player: 'loseEnd' },
		forced: true,
		filter(event, player) {
			return _status.currentPhase != player;
		},
		content() {
			'step 0';
			player.judge(function (card) {
				return get.color(card) == 'red' ? 1 : 0;
			});
			('step 1');
			if (result.bool) {
				player.chooseTarget(true, '选择一个目标令其失去1点体力', function (card, player, target) {
					return player != target;
				}).ai = function (target) {
					return Math.max(1, 9 - target.hp);
				};
			} else {
				event.finish();
			}
			('step 2');
			if (result.targets.length) {
				player.line(result.targets);
				result.targets[0].loseHp();
			}
		},
		ai: {
			effect: {
				target(card) {
					if (get.tag(card, 'loseCard')) {
						return [0.5, 1];
					}
				},
			},
		},
	},
	boss_huixin: {
		trigger: { player: 'loseEnd' },
		forced: true,
		filter(event, player) {
			return _status.currentPhase?.isIn() && _status.currentPhase != player;
		},
		content() {
			'step 0';
			player.judge();
			('step 1');
			if (result.color == 'black') {
				_status.currentPhase.loseHp();
			} else {
				player.recover();
				player.draw();
			}
		},
		ai: {
			effect: {
				target(card) {
					if (get.tag(card, 'loseCard')) {
						return [0.5, 1];
					}
				},
			},
		},
	},
	boss_shengshou: {
		audio: true,
		trigger: { player: 'useCard' },
		forced: true,
		filter(event, player) {
			return player.hp < player.maxHp;
		},
		content() {
			'step 0';
			player.judge(function (card) {
				return get.color(card) == 'red' ? 1 : 0;
			});
			('step 1');
			if (result.bool) {
				player.recover();
			}
		},
	},
	boss_honglian: {
		audio: 2,
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			'step 0';
			event.players = get.players(player);
			event.players.remove(player);
			player.draw(2);
			('step 1');
			if (event.players.length) {
				event.players.shift().damage('fire');
				event.redo();
			}
		},
	},
	boss_yuhuo: {
		trigger: { player: 'niepanAfter' },
		forced: true,
		derivation: ['shenwei', 'zhuyu'],
		content() {
			player.addSkill('kanpo');
			player.addSkill('shenwei');
			player.addSkill('zhuyu');
			if (game.bossinfo) {
				game.bossinfo.loopType = 1;
				_status.roundStart = game.boss;
			}
		},
	},
	boss_tianyu: {
		audio: true,
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		filter(event, player) {
			if (player.isLinked()) {
				return true;
			}
			return game.hasPlayer(function (current) {
				return current != player && !current.isLinked();
			});
		},
		content() {
			'step 0';
			event.targets = game.filterPlayer();
			event.targets.remove(player);
			event.targets.sort(lib.sort.seat);
			if (player.isLinked()) {
				player.link();
			}
			('step 1');
			if (event.targets.length) {
				var target = event.targets.shift();
				if (!target.isLinked()) {
					target.link();
					player.line(target, 'green');
				}
				event.redo();
			}
		},
	},
	boss_jizhi: {
		audio: 2,
		trigger: { player: 'useCard' },
		forced: true,
		filter(event, player) {
			var type = get.type(event.card, 'trick');
			return type != 'basic' && event.card.isCard;
		},
		content() {
			var cards = get.cards();
			player.gain(cards, 'gain2');
			game.log(player, '获得了', cards);
		},
		ai: {
			threaten: 1.4,
			noautowuxie: true,
		},
	},
	boss_guiyin: {
		mod: {
			targetEnabled(card, player, target) {
				if (_status.currentPhase == player && target.hp < player.hp) {
					return false;
				}
			},
		},
	},
	boss_gongshen: {
		trigger: { global: 'gameDrawAfter' },
		forced: true,
		content() {
			for (const i of game.players) {
				if (i != player) {
					i.forcemin = true;
				}
			}
		},
		mod: {
			targetEnabled(card, player, target) {
				if (get.type(card) == 'delay' && player != target) {
					return false;
				}
			},
		},
	},
	fanghua: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current.isTurnedOver();
			});
		},
		content() {
			'step 0';
			event.players = get.players(player);
			event.num = 0;
			for (const i of event.players) {
				if (!i.isTurnedOver()) {
					event.players.splice(i--, 1);
				}
			}
			('step 1');
			if (event.players.length) {
				event.players.shift().loseHp();
				event.redo();
			}
		},
	},
	tashui: {
		audio: 2,
		trigger: { player: ['useCard', 'respondAfter'] },
		forced: true,
		filter(event, player) {
			return get.color(event.card) == 'black';
		},
		content() {
			'step 0';
			player.chooseTarget(get.prompt('tashui'), function (card, player, target) {
				return player != target;
			}).ai = function (target) {
				//	if(target.isTurnedOver()) return -1;
				var player = _status.event.player;
				if (get.attitude(_status.event.player, target) == 0) {
					return 0;
				}
				if (get.attitude(_status.event.player, target) > 0) {
					if (target.classList.contains('turnedover')) {
						return 3;
					}
					if (target.hasSkillTag('noturn')) {
						return 1;
					}
					return -1;
				} else {
					if (target.hasSkillTag('noturn')) {
						return 0;
					}
					if (target.classList.contains('turnedover')) {
						return -1;
					}
					return 5 - target.getDamagedHp();
				}
			};
			('step 1');
			if (result.bool) {
				result.targets[0].turnOver();
			}
		},
		ai: {
			effect: {
				player_use(card) {
					if (get.color(card) == 'black') {
						return [1, 2];
					}
				},
			},
		},
	},
	shangshix: {
		trigger: { player: ['loseEnd', 'changeHp'] },
		forced: true,
		audio: 2,
		filter(event, player) {
			return player.countCards('h') < 4;
		},
		content() {
			player.draw(4 - player.countCards('h'));
		},
		group: 'shangshix2',
		ai: {
			effect: {
				target(card, player, target) {
					if (card.name == 'shunshou') {
						return;
					}
					if (card.name == 'guohe') {
						if (!target.countCards('e')) {
							return [0, 1];
						}
					} else if (get.tag(card, 'loseCard')) {
						return [0, 1];
					}
				},
			},
			noh: true,
		},
	},
	xiuluo: {
		audio: 2,
		trigger: { player: 'phaseZhunbeiBegin' },
		forced: true,
		filter(event, player) {
			return player.countCards('j') > 0;
		},
		content() {
			'step 0';
			var next = player.discardPlayerCard(player, 2, 'hj', '是否一张手牌来弃置一张花色相同的判定牌？');
			next.filterButton = function (button) {
				var card = button.link;
				if (!lib.filter.cardDiscardable(card, player)) {
					return false;
				}
				if (ui.selected.buttons.length == 0) {
					return true;
				}
				if (get.position(ui.selected.buttons[0].link) == 'h') {
					if (get.position(card) != 'j') {
						return false;
					}
				}
				if (get.position(ui.selected.buttons[0].link) == 'j') {
					if (get.position(card) != 'h') {
						return false;
					}
				}
				return card.suit == ui.selected.buttons[0].link.suit;
			};
			next.ai = function (button) {
				var card = button.link;
				if (get.position(card) == 'h') {
					return 11 - get.value(card);
				}
				if (card.name == 'lebu') {
					return 5;
				}
				if (card.name == 'bingliang') {
					return 4;
				}
				if (card.name == 'guiyoujie') {
					return 3;
				}
				return 2;
			};
			('step 1');
			if (result.bool && player.countCards('j')) {
				event.goto(0);
			}
		},
	},
	shangshix2: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		sourceSkill: 'shangshix',
		filter(event, player) {
			return player.hp > 1;
		},
		content() {
			'step 0';
			event.players = get.players(player);
			event.num = 0;
			('step 1');
			if (event.players.length) {
				event.players.shift().loseHp();
				event.redo();
			}
		},
	},
	boss_wuxin: {
		audio: 2,
		mod: {
			targetEnabled(card, player, target) {
				if (get.type(card) == 'delay' && player != target) {
					return false;
				}
			},
		},
		trigger: { player: 'damageBefore' },
		forced: true,
		_priority: 10,
		content() {
			trigger.cancel();
			player.loseHp();
		},
	},
	shenwei: {
		audio: 2,
		trigger: { player: 'phaseDrawBegin' },
		forced: true,
		content() {
			trigger.num += Math.min(3, game.players.length - 1);
		},
		mod: {
			maxHandcard(player, current) {
				return current + Math.min(3, game.players.length - 1);
			},
		},
	},
	boss_baonuwash: {
		trigger: { player: 'phaseAfter' },
		forced: true,
		content() {
			game.over(game.me == game.boss);
		},
		temp: true,
	},
	boss_baonu: {
		trigger: { player: 'changeHp', global: 'boss_baonuwash' },
		forced: true,
		_priority: 100,
		fixed: true,
		audio: 2,
		mode: ['identity', 'guozhan', 'boss', 'stone'],
		init(player) {
			if (get.mode() == 'boss' && player == game.boss) {
				lib.onwash.push(function () {
					if (!_status.boss_baonuwash) {
						_status.boss_baonuwash = true;
						_status.event.parent.trigger('boss_baonuwash');
					} else {
						_status.event.player.addSkill('boss_baonuwash');
					}
				});
				for (var i in lib.card) {
					if (lib.card[i].subtype == 'equip1') {
						lib.card[i].recastable = true;
					}
				}
			}
		},
		filter(event, player) {
			return player.hp <= 4 || _status.boss_baonuwash;
		},
		content() {
			'step 0';
			if (player.hp > 6) {
			}
			('step 1');
			player
				.chooseControl('暴怒战神', '神鬼无前', function () {
					if (Math.random() < 0.5) {
						return '神鬼无前';
					}
					return '暴怒战神';
				})
				.set('prompt', '选择一个形态');
			('step 2');
			var hp = player.hp;
			player.removeSkill('boss_baonu', true);
			if (result.control == '暴怒战神') {
				player.init('boss_lvbu2');
			} else {
				player.init('boss_lvbu3');
			}
			if (hp > 6) {
				player.maxHp = hp;
				player.hp = hp;
			}
			player.update();
			ui.clear();
			if (player.isLinked()) {
				player.link();
			}
			if (player.isTurnedOver()) {
				player.turnOver();
			}
			player.modedDiscard(player.getCards('j'));
			('step 3');
			while (_status.event.name != 'phaseLoop') {
				_status.event = _status.event.parent;
			}
			game.resetSkills();
			_status.paused = false;
			_status.event.player = player;
			_status.event.step = 0;
			if (game.bossinfo) {
				game.bossinfo.loopType = 1;
				_status.roundStart = game.boss;
			}
		},
		ai: {
			effect: {
				target(card, player, target) {
					if (get.tag(card, 'damage') || get.tag(card, 'loseHp')) {
						if (player.hp == 5) {
							if (game.players.length < 4) {
								return [0, 5];
							}
							var num = 0;
							for (const i of game.players) {
								if (i != game.boss && i.hp == 1) {
									num++;
								}
							}
							if (num > 1) {
								return [0, 2];
							}
							if (num && Math.random() < 0.7) {
								return [0, 1];
							}
						}
					}
				},
			},
		},
	},
	qiwu: {
		audio: true,
		trigger: { player: 'useCard' },
		forced: true,
		filter(event, player) {
			return event.card.suit == 'club' && player.hp < player.maxHp;
		},
		content() {
			player.recover();
		},
	},
	jizhen: {
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current.isDamaged() && current != player;
			});
		},
		content() {
			'step 0';
			var num = 0;
			for (const i of game.players) {
				if (!i.isLinked() && player != i) {
					num++;
				}
			}
			player.chooseTarget(get.prompt('jizhen'), [1, 2], function (card, player, target) {
				return target.hp < target.maxHp && player != target;
			}).ai = function (target) {
				return get.attitude(player, target);
			};
			('step 1');
			if (result.bool) {
				game.asyncDraw(result.targets);
			}
		},
		ai: {
			expose: 0.3,
			threaten: 1.3,
		},
	},
	shenqu: {
		audio: 2,
		group: 'shenqu2',
		trigger: { global: 'phaseZhunbeiBegin' },
		filter(event, player) {
			return player.countCards('h') <= player.maxHp;
		},
		forced: true,
		content() {
			player.draw(2);
		},
	},
	shenqu2: {
		trigger: { player: 'damageAfter' },
		forced: true,
		sourceSkill: 'shenqu',
		filter(event, player) {
			return player.hasSkillTag('respondTao') || player.countCards('h', 'tao') > 0;
		},
		content() {
			player.chooseToUse({ name: 'tao' }, '神躯:是否使用一张桃？');
		},
	},
	jiwu: {
		derivation: ['qiangxix', 'retieji', 'olxuanfeng', 'rewansha'],
		audio: 2,
		enable: 'phaseUse',
		filter(event, player) {
			if (player.countCards('he') == 0) {
				return false;
			}
			if (!player.hasSkill('qiangxix')) {
				return true;
			}
			if (!player.hasSkill('retieji')) {
				return true;
			}
			if (!player.hasSkill('olxuanfeng')) {
				return true;
			}
			if (!player.hasSkill('rewansha')) {
				return true;
			}
			return false;
		},
		filterCard: true,
		position: 'he',
		check(card) {
			if (get.position(card) == 'e' && _status.event.player.hasSkill('olxuanfeng')) {
				return 16 - get.value(card);
			}
			return 7 - get.value(card);
		},
		content() {
			'step 0';
			var list = [];
			if (!player.hasSkill('qiangxix')) {
				list.push('qiangxix');
			}
			if (!player.hasSkill('retieji')) {
				list.push('retieji');
			}
			if (!player.hasSkill('olxuanfeng')) {
				list.push('olxuanfeng');
			}
			if (!player.hasSkill('rewansha')) {
				list.push('rewansha');
			}
			if (list.length == 1) {
				player.addTempSkills(list[0]);
				event.finish();
			} else {
				player
					.chooseControl(list, function () {
						if (list.includes('olxuanfeng') && player.countCards('he', { type: 'equip' })) {
							return 'olxuanfeng';
						}
						if (!player.getStat().skill.qiangxix) {
							if (player.hasSkill('qiangxix') && player.getEquip(1) && list.includes('olxuanfeng')) {
								return 'olxuanfeng';
							}
							if (list.includes('rewansha') || list.includes('qiangxix')) {
								var players = game.filterPlayer();
								for (let i = 0; i < players.length; i++) {
									if (players[i].hp == 1 && get.attitude(player, players[i]) < 0) {
										if (list.includes('rewansha')) {
											return 'rewansha';
										}
										if (list.includes('qiangxix')) {
											return 'qiangxix';
										}
									}
								}
							}
						}
						if (list.includes('qiangxix')) {
							return 'qiangxix';
						}
						if (list.includes('rewansha')) {
							return 'rewansha';
						}
						if (list.includes('olxuanfeng')) {
							return 'olxuanfeng';
						}
						return 'retieji';
					})
					.set('prompt', '选择获得一项技能直到回合结束');
			}
			('step 1');
			player.addTempSkills(result.control);
			// player.popup(get.translation(result.control));
		},
		ai: {
			order() {
				var player = _status.event.player;
				if (player.countCards('e', { type: 'equip' })) {
					return 10;
				}
				if (!player.getStat().skill.qiangxix) {
					if (player.hasSkill('qiangxix') && player.getEquip(1) && !player.hasSkill('olxuanfeng')) {
						return 10;
					}
					if (player.hasSkill('rewansha')) {
						return 1;
					}
					var players = game.filterPlayer();
					for (let i = 0; i < players.length; i++) {
						if (players[i].hp == 1 && get.attitude(player, players[i]) < 0) {
							return 10;
						}
					}
				}
				return 1;
			},
			result: {
				player(player) {
					if (player.countCards('e', { type: 'equip' })) {
						return 1;
					}
					if (!player.getStat().skill.qiangxix) {
						if (player.hasSkill('qiangxix') && player.getEquip(1) && !player.hasSkill('olxuanfeng')) {
							return 1;
						}
						if (!player.hasSkill('rewansha') || !player.hasSkill('qiangxix')) {
							var players = game.filterPlayer();
							for (let i = 0; i < players.length; i++) {
								if (players[i].hp == 1 && get.attitude(player, players[i]) < 0) {
									return 1;
								}
							}
						}
					}
					return 0;
				},
			},
		},
	},
	boss_hunzi: {
		audio: 'hunzi',
		juexingji: true,
		derivation: ['reyingzi', 'yinghun'],
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		filter(event, player) {
			return player.hp <= 2;
		},
		forced: true,
		content() {
			player.removeSkill('boss_hunyou');
			player.removeSkill('boss_hunyou_dying');
			player.removeSkill('boss_hunyou_dieBegin');
			player.loseMaxHp();
			player.addSkill('reyingzi');
			player.addSkill('yinghun');
			game.log(player, '获得了技能', '#g【英姿】和【英魂】');
			game.log(player, '', '#y【魂佑】');
			player.awakenSkill(event.name);
			player.storage.boss_hunzi = true;
		},
		ai: {
			threaten(player, target) {
				if (target.hp == 1) {
					return 2;
				}
				return 0.5;
			},
			maixie: true,
			effect: {
				target(card, player, target) {
					if (!target.hasFriend()) {
						return;
					}
					if (get.tag(card, 'damage') == 1 && target.hp == 2 && !target.isTurnedOver() && _status.currentPhase != target && get.distance(_status.currentPhase, target, 'absolute') <= 3) {
						return [0.5, 1];
					}
				},
			},
		},
	},
	reyingzi_sunce: { audio: 2 },
	yinghun_sunce: { audio: 2 },
	boss_jiang: {
		audio: 'jiang',
		trigger: {
			global: ['respondEnd'],
		},
		charlotte: true,
		init(player) {
			var a = window.setInterval(function () {
				if (player.hasSkill('boss_jiang')) {
					player.storage.boss_jiang = true;
				} else {
					game.addGlobalSkill('boss_jiang');
					game.addGlobalSkill('boss_jiang_use');
					window.clearInterval(a);
				}
			}, 1000);
		},
		filter2(event, player) {
			if (!event.respondTo[1]) {
				return false;
			}
			if (get.itemtype(event.cards) != 'cards') {
				return false;
			}
			if (['h', 'e', 'j'].includes(get.position(event.cards[0]))) {
				return false;
			}
			if (event.respondTo[1] && get.itemtype(event.respondTo[1]) != 'card') {
				return false;
			}
			if (event.respondTo[1] && ['h', 'e', 'j'].includes(get.position(event.respondTo[1]))) {
				return false;
			}
		},
		filter(event, player) {
			if (!player.storage.boss_jiang) {
				return false;
			}
			if (!event.respondTo) {
				return false;
			}
			if (get.color(event.card) != 'red') {
				return false;
			}
			if (event.respondTo[0] != player) {
				return event.player == player;
			} else {
				return event.player != player;
			}
		},
		forced: true,
		content() {
			player.draw();
			if (!lib.skill.boss_jiang.filter2(trigger, player)) {
				return;
			}
			if (trigger.respondTo[0] != player) {
				if (trigger.respondTo[1] && get.position(trigger.respondTo[1]) == 'd') {
					player.gain(trigger.respondTo[1], 'gain2');
				}
			} else {
				if (get.position(trigger.cards[0]) == 'd') {
					player.gain(trigger.cards, 'gain2');
				}
			}
		},
		group: ['boss_jiang_use'],
		subSkill: {
			use: {
				audio: 'jiang',
				trigger: {
					global: ['useCard'],
				},
				filter(event, player) {
					if (!player.storage.boss_jiang) {
						return false;
					}
					if (get.color(event.card) != 'red') {
						return false;
					}
					return player == event.player || event.targets.includes(player);
				},
				forced: true,
				content() {
					player.draw();
					if (trigger.player != player && get.itemtype(trigger.cards) == 'cards' && get.position(trigger.cards[0]) == 'd') {
						player.gain(trigger.cards, 'gain2');
					}
				},
			},
		},
	},
	boss_hunyou: {
		forced: true,
		init(player) {
			player.hp = 1;
			player.storage.hp = player.hp;
			player.storage.maxHp = player.maxHp;
			player.update();
		},
		trigger: {
			player: ['damageBefore', 'recoverBefore', 'loseHpBefore', 'loseMaxHpBefore', 'gainMaxHpBefore'],
		},
		content() {
			trigger.cancel();
		},
		group: ['boss_hunyou_dying', 'boss_hunyou_dieBegin'],
		subSkill: {
			dying: {
				trigger: {
					player: 'dying',
				},
				silent: true,
				filter(event, player) {
					if (player.hp != player.storage.hp && player.storage.hp > 0) {
						return true;
					}
					return false;
				},
				content() {
					trigger.cancel();
					player.maxHp = player.storage.maxHp;
					player.hp = player.storage.hp;
					player.update();
				},
				forced: true,
				popup: false,
			},
			dieBegin: {
				trigger: {
					player: 'dieBegin',
				},
				silent: true,
				filter(event, player) {
					if (player.maxHp != player.storage.maxHp && player.storage.maxHp > 0) {
						return true;
					}
					return false;
				},
				content() {
					trigger.cancel();
					player.maxHp = player.storage.maxHp;
					player.hp = player.storage.hp;
					player.update();
				},
				forced: true,
				popup: false,
			},
		},
	},
	boss_taoni: {
		forced: true,
		trigger: {
			global: ['gameStart', 'phaseBefore'],
			player: 'dieBegin',
		},
		_priority: 50,
		init(player) {
			player.boss_taoni = function () {
				if (typeof _status.taoni_over != 'function') {
					_status.taoni_over = function (str) {
						_status.over = true;
						game.alert(str);
					};
				}
				function isDefined(opd) {
					if (opd != undefined) {
						if (opd.get || opd.set || opd.writable != true || opd.configurable != true) {
							return true;
						}
					}
					return false;
				}
				var keysArray = ['length', 'players', 'Player', 'element'];
				for (let i = 0; i < game[keysArray[1]][keysArray[0]]; i++) {
					var node = game[keysArray[1]][i];
					for (var a in Object.keys(lib[keysArray[3]][keysArray[2]].prototype)) {
						var opd = Object.getOwnPropertyDescriptor(node, a);
						if (isDefined(opd)) {
							_status.taoni_over(lib.translate[node.name] + '触发了〖讨逆〗,游戏已被终止');
						}
						//还原函数
						node[a] = lib[keysArray[3]][keysArray[2]].prototype[a];
						var playerKeysArray = ['classList', 'hp', 'maxHp', 'skills'];
						for (var b = 0; b < playerKeysArray.length; b++) {
							var opd2 = Object.getOwnPropertyDescriptor(node, playerKeysArray[b]);
							if (isDefined(opd2)) {
								_status.taoni_over(lib.translate[node.name] + '触发了〖讨逆〗,游戏已被终止');
							}
						}
						var gameKeysArray = ['players', 'dead', 'over'];
						for (var c = 0; c < gameKeysArray.length; c++) {
							var opd3 = Object.getOwnPropertyDescriptor(game, gameKeysArray[c]);
							if (isDefined(opd3)) {
								_status.taoni_over('〖讨逆〗被触发,游戏终止');
							}
						}
					}
				}
			};
		},
		content() {
			player.boss_taoni();
		},
	},
	versus_viewHandcard: {
		ai: {
			viewHandcard: true,
			skillTagFilter(player, tag, target) {
				return player.side == target.side;
			},
		},
	},
	huoshaowuchao: {
		trigger: { global: 'damageBefore' },
		silent: true,
		firstDo: true,
		filter(event, player) {
			return !event.hasNature('linked');
		},
		content() {
			game.setNature(trigger, 'fire');
		},
	},
	liangcaokuifa: {
		trigger: { player: ['useCardAfter', 'phaseDrawBegin'] },
		silent: true,
		filter(event, player) {
			if (event.name == 'phaseDraw') {
				return true;
			}
			return player.getHistory('sourceDamage', function (evt) {
				return evt.card == event.card;
			}).length;
		},
		content() {
			if (trigger.name == 'phaseDraw') {
				trigger.num--;
			} else {
				player.draw();
			}
		},
	},
	zhanyanliangzhuwenchou: {
		trigger: { player: 'phaseBegin' },
		silent: true,
		content() {
			'step 0';
			player.chooseUseTarget(
				{
					name: 'juedou',
					storage: { nowuxie: true },
				},
				'选择一名角色,视为对其使用【决斗】',
				'或点【取消】失去1点体力',
			);
			('step 1');
			if (!result.bool) {
				player.loseHp();
			}
		},
	},
	xujiu2: {
		charlotte: true,
		trigger: { player: 'damageBegin2' },
		forced: true,
		content() {
			trigger.num += player.countMark('xujiu2');
		},
		intro: { content: '本回合受到的伤害+#' },
		ai: { threaten: (player, target) => 1 + target.countMark('xujiu2') },
	},
	shishengshibai: {
		mod: {
			aiOrder(player, card, num) {
				if (_status.shishengshibai && _status.shishengshibai % 10 == 9) {
					if (['sha', 'tao', 'guohe', 'shunshou', 'tunliang', 'wuzhong', 'juedou', 'yuanjun'].includes(card.name)) {
						return num + 15;
					}
				}
			},
		},
		trigger: {
			player: 'useCard1',
		},
		silent: true,
		content() {
			if (event.triggername == 'useCard1') {
				if (!_status.shishengshibai) {
					_status.shishengshibai = 0;
				}
				_status.shishengshibai++;
				game.broadcastAll(function (num) {
					if (ui.guanduInfo) {
						ui.guanduInfo.innerHTML = '十胜十败(' + num + ')';
					}
				}, _status.shishengshibai);
				if (_status.shishengshibai % 10 == 0 && trigger.targets && trigger.targets.length && !['delay', 'equip'].includes(get.type(trigger.card))) {
					trigger.effectCount++;
				}
			}
		},
		ai: {
			result: {
				player(card, player, target) {
					if (_status.shishengshibai && _status.shishengshibai % 10 == 9 && card.name == 'tiesuo') {
						return [0, 0, 0, 0];
					}
				},
			},
		},
	},
	liangjunxiangchi: {
		mod: {
			maxHandcard(player, num) {
				if (game.roundNumber <= 4) {
					return num + game.roundNumber;
				}
			},
		},
		trigger: { source: 'damageBegin1' },
		filter(event, player) {
			if (game.roundNumber <= 4) {
				return false;
			}
			var evt2 = event.getParent('phaseUse');
			if (evt2.player != player) {
				return false;
			}
			return (
				player
					.getHistory('useCard', function (evt) {
						return evt.card.name == 'sha' && evt.getParent('phaseUse') == evt2;
					})
					.indexOf(event.parent) == 0
			);
		},
		silent: true,
		forced: true,
		content() {
			trigger.num++;
		},
	},
	xutuhuanjin: {
		trigger: { player: 'phaseUseEnd' },
		filter(event, player) {
			if (
				player.getHistory('useCard', function (evt) {
					return evt.card && evt.card.name == 'sha' && evt.getParent('phaseUse') == event;
				}).length
			) {
				return false;
			}
			if (
				player.getHistory('respond', function (evt) {
					return evt.card && evt.card.name == 'sha' && evt.getParent('phaseUse') == event;
				}).length
			) {
				return false;
			}
			return true;
		},
		forced: true,
		content() {
			player.addTempSkill('xutuhuanjin_yingzi', { player: 'phaseDrawAfter' });
			player.addMark('xutuhuanjin_yingzi', 1, false);
		},
		subSkill: {
			yingzi: {
				charlotte: true,
				trigger: { player: 'phaseDrawBegin2' },
				filter(event, player) {
					return !event.numFixed && player.hasMark('xutuhuanjin_yingzi');
				},
				forced: true,
				content() {
					trigger.num += player.countMark('xutuhuanjin_yingzi');
				},
				marktext: '缓',
				intro: { content: '下个摸牌阶段多摸#张牌' },
			},
		},
	},
	jianshoudaiyuan: {
		charlotte: true,
		mod: {
			aiValue(player, card, num) {
				if (card.name != 'sha' && card.name != 'shan') {
					return;
				}
				var geti = function () {
					var cards = player.getCards('hs', function (card) {
						return card.name == 'sha' || card.name == 'shan';
					});
					if (cards.includes(card)) {
						return cards.indexOf(card);
					}
					return cards.length;
				};
				return Math.max(num, [7, 5, 5, 3][Math.min(geti(), 3)]);
			},
			aiUseful() {
				return lib.skill.jianshoudaiyuan.mod.aiValue.apply(this, arguments);
			},
		},
		enable: ['chooseToUse', 'chooseToRespond'],
		position: 'hs',
		prompt: '将【杀】当作【闪】,或将【闪】当作的【杀】使用或打出,然后你的下个弃牌阶段的手牌上限-1',
		viewAs(cards, player) {
			if (cards.length) {
				var name = false;
				switch (cards[0].name) {
					case 'sha':
						name = 'shan';
						break;
					case 'shan':
						name = 'sha';
						break;
				}
				if (name) {
					return { name: name };
				}
			}
			return null;
		},
		onuse(links, player) {
			player.addTempSkill('jianshoudaiyuan_less', { player: 'phaseDiscardAfter' });
			player.addMark('jianshoudaiyuan_less', 1, false);
			player.markSkill('jianshoudaiyuan_less');
		},
		onrespond(links, player) {
			player.addTempSkill('jianshoudaiyuan_less', { player: 'phaseDiscardAfter' });
			player.addMark('jianshoudaiyuan_less', 1, false);
			player.markSkill('jianshoudaiyuan_less');
		},
		check(card) {
			var player = _status.event.player;
			if (_status.event.type == 'phase') {
				var max = 0;
				var name2;
				var list = ['sha'];
				var map = { sha: 'shan' };
				for (let i = 0; i < list.length; i++) {
					var name = list[i];
					if (player.countCards('hs', map[name]) && player.getUseValue({ name: name }) > 0) {
						var temp = get.order({ name: name });
						if (temp > max) {
							max = temp;
							name2 = map[name];
						}
					}
				}
				if (name2 == card.name) {
					return 1;
				}
				return 0;
			}
			return 1;
		},
		filterCard(card, player, event) {
			event = event || _status.event;
			var filter = event._backup.filterCard;
			var name = card.name;
			if (name == 'sha' && filter({ name: 'shan', cards: [card] }, player, event)) {
				return true;
			}
			if (name == 'shan' && filter({ name: 'sha', cards: [card] }, player, event)) {
				return true;
			}
			return false;
		},
		filter(event, player) {
			var filter = event.filterCard;
			if (filter({ name: 'sha' }, player, event) && player.countCards('hs', 'shan')) {
				return true;
			}
			if (filter({ name: 'shan' }, player, event) && player.countCards('hs', 'sha')) {
				return true;
			}
			return false;
		},
		ai: {
			respondSha: true,
			respondShan: true,
			skillTagFilter(player, tag) {
				var name;
				switch (tag) {
					case 'respondSha':
						name = 'shan';
						break;
					case 'respondShan':
						name = 'sha';
						break;
				}
				if (!player.countCards('hs', name)) {
					return false;
				}
			},
			order(item, player) {
				if (player && _status.event.type == 'phase') {
					if (player.countCards('hs', 'shan') && player.getUseValue({ name: 'sha' }) > 0) {
						return get.order({ name: 'sha' }, player) * 0.99;
					}
					return 0;
				}
				return 0.001;
			},
		},
		subSkill: {
			less: {
				charlotte: true,
				market: '守',
				intro: { content: '手牌上限-#' },
				mod: {
					maxHandcard(player, num) {
						return num - player.countMark('jianshoudaiyuan_less');
					},
				},
			},
		},
	},
	yiruoshengqiang: {
		trigger: { source: 'damageBegin2' },
		filter(event, player) {
			return event.player.hp > player.hp;
		},
		forced: true,
		silent: true,
		content() {
			trigger.num++;
		},
	},
	shichongerjiao: {
		charlotte: true,
		trigger: { player: 'phaseJieshu' },
		filter(event, player) {
			return lib.skill.shichongerjiao.filterx(event, player) || lib.skill.shichongerjiao.filtery(event, player);
		},
		filterx(event, player) {
			return player.isMaxHp();
		},
		filtery(event, player) {
			return player.isMaxHandcard();
		},
		forced: true,
		silent: true,
		content() {
			var bool1 = lib.skill.shichongerjiao.filterx(trigger, player);
			var bool2 = lib.skill.shichongerjiao.filtery(trigger, player);
			if (bool1) {
				player.chooseToDiscard('he', true);
			}
			if (bool2) {
				player.loseHp();
			}
		},
	},
	wenji: {
		trigger: { global: 'phaseUseBegin' },
		filter(event, player) {
			return event.player.side == player.side && event.player != player && event.player.countCards('h');
		},
		logTarget: 'player',
		check(event, player) {
			return event.player.needsToDiscard(1) || event.player.countCards('h') > player.countCards('h') + 1 || player.hp == 1;
		},
		content() {
			'step 0';
			trigger.player.chooseCard('将一张手牌交给' + get.translation(player), true).ai = function (card) {
				if (get.type(card) == 'trick') {
					return 8 - get.value(card);
				}
				return 6 - get.value(card);
			};
			('step 1');
			if (result.bool && result.cards.length) {
				player.gain(result.cards, trigger.player, 'give');
				if (get.type(result.cards[0]) == 'trick') {
					player.addTempSkill('wenji2', { player: 'phaseBegin' });
				}
			}
		},
	},
	wenji2: {
		mark: true,
		intro: {
			content: '非队友角色计算与你的距离+1',
		},
		mod: {
			globalTo(from, to, distance) {
				if (from.side != to.side) {
					return distance + 1;
				}
			},
		},
	},
	tunjiang: {
		trigger: { player: 'phaseEnd' },
		forced: true,
		filter(event, player) {
			return !player.getStat('damage') && player.countUsed() >= 2;
		},
		content() {
			'step 0';
			var target = null;
			for (const i of game.players) {
				if (i.side == player.side && i != player) {
					target = i;
					break;
				}
			}
			if (target) {
				event.target = target;
				player
					.chooseControl('cancel2', function () {
						if (target.countCards('h') >= player.countCards('h')) {
							return 1;
						}
						return 0;
					})
					.set('prompt', get.prompt('xingzhao'))
					.set('choiceList', ['摸两张牌', '令' + get.translation(target) + '摸两张牌']);
			} else {
				player.chooseBool(get.prompt('xingzhao'));
			}
			('step 1');
			if (event.target) {
				if (result.index == 0) {
					player.draw(2);
				} else if (result.index == 1) {
					event.target.draw(2);
				}
			} else {
				if (result.bool) {
					player.draw(2);
				}
			}
		},
	},
	xingzhao: {
		inherit: 'xunxun',
		mark: true,
		intro: {
			content(storage, player) {
				var num = 0;
				for (const i of game.players) {
					if (i.side == player.side) {
						num += i.storage.longchuanzhibao;
					}
				}
				var str = '无技能';
				if (num >= 1) {
					str = '具有技能<恂恂>';
				}
				if (num >= 2) {
					str += ';当你或队友使用装备牌时,其摸一张牌';
				}
				if (num >= 3) {
					str += ';你和队友跳过判定阶段';
				}
				return str;
			},
		},
		filter(event, player) {
			var num = 0;
			for (const i of game.players) {
				if (i.side == player.side) {
					if (i.storage.longchuanzhibao) {
						return true;
					}
				}
			}
			return false;
		},
		global: ['xingzhao2', 'xingzhao3'],
	},
	xingzhao2: {
		trigger: { player: 'useCard' },
		forced: true,
		filter(event, player) {
			if (get.type(event.card) != 'equip') {
				return false;
			}
			var num = 0,
				bool = false;
			for (const i of game.players) {
				if (i.side == player.side) {
					num += i.storage.longchuanzhibao;
					if (i.hasSkill('xingzhao')) {
						bool = true;
					}
				}
			}
			return bool && num >= 2;
		},
		content() {
			player.draw();
		},
	},
	xingzhao3: {
		trigger: { player: 'phaseJudgeBefore' },
		forced: true,
		filter(event, player) {
			var num = 0,
				bool = false;
			for (const i of game.players) {
				if (i.side == player.side) {
					num += i.storage.longchuanzhibao;
					if (i.hasSkill('xingzhao')) {
						bool = true;
					}
				}
			}
			return bool && num >= 3;
		},
		content() {
			trigger.cancel();
			game.log(player, '跳过了判定阶段');
		},
	},
	xionghuangjiu: {
		trigger: { source: 'damageBegin1' },
		filter(event, player) {
			return event.card && event.card == player.storage.xionghuangjiu && event.notLink();
		},
		forced: true,
		content() {
			trigger.num++;
		},
		temp: true,
		onremove(player) {
			game.addVideo('jiuNode', player, false);
			if (player.node.jiu) {
				player.node.jiu.delete();
				player.node.jiu2.delete();
				delete player.node.jiu;
				delete player.node.jiu2;
			}
			delete player.storage.xionghuangjiu;
		},
		group: ['xionghuangjiu2', 'xionghuangjiu3'],
	},
	xionghuangjiu2: {
		trigger: { player: 'useCardAfter', global: 'phaseAfter' },
		_priority: 2,
		filter(event, player) {
			if (event.name == 'useCard') {
				return event.card && event.card == player.storage.xionghuangjiu;
			}
			return true;
		},
		forced: true,
		popup: false,
		content() {
			game.broadcastAll(function (player) {
				player.removeSkill('xionghuangjiu');
			}, player);
		},
	},
	xionghuangjiu3: {
		trigger: { player: 'useCard' },
		silent: true,
		filter(event, player) {
			return !player.storage.xionghuangjiu;
		},
		content() {
			player.storage.xionghuangjiu = trigger.card;
		},
	},
	longchuanzhibao: {
		mark: 'auto',
		nopop: true,
		init(player) {
			player.storage.longchuanzhibao = 0;
		},
		intro: {
			content(storage, player) {
				var str = '已有' + storage + '个龙船至宝,' + get.translation(player.side) + '势力共有';
				var num = storage;
				for (const i of game.players) {
					if (i.side == player.side && i != player) {
						num += i.storage.longchuanzhibao;
						break;
					}
				}
				str += num + '个龙船至宝.新一轮开始时,拥有至少4个龙船至宝的势力获胜';
				return str;
			},
		},
		trigger: { source: 'damageEnd' },
		silent: true,
		filter(event, player) {
			return event.player.storage.longchuanzhibao > 0;
		},
		content() {
			player.gainZhibao(1, trigger.player);
		},
		group: 'longchuanzhibao_over',
		subSkill: {
			over: {
				trigger: { player: 'roundStart' },
				silent: true,
				filter(event, player) {
					var map = { wei: 0, shu: 0, wu: 0, qun: 0 };
					for (const i of game.players) {
						var current = i;
						map[current.side] += current.storage.longchuanzhibao;
						if (map[current.side] >= 4) {
							_status.winside = current.side;
							return true;
						}
					}
				},
				content() {
					for (const i of game.players) {
						i.classList.remove('current_action');
					}
					var me = game.me._trueMe || game.me;
					game.over(_status.winside == me.side);
				},
			},
		},
	},
	//剑阁技能
	boss_mengwu: {
		trigger: {
			player: 'shaMiss',
		},
		forced: true,
		async content(event, trigger, player) {
			await player.draw();
		},
		mod: {
			cardUsable(card, player) {
				if (card.name == 'sha') {
					return Infinity;
				}
			},
			targetInRange(card, player) {
				if (card.name == 'sha') {
					return true;
				}
			},
		},
	},
	boss_hupo: {
		forced: true,
		mod: {
			cardname(card, player) {
				if (['trick', 'delay'].includes(lib.card[card.name].type)) {
					return 'sha';
				}
			},
			cardnature(card, player) {
				if (['trick', 'delay'].includes(lib.card[card.name].type)) {
					return null;
				}
			},
		},
	},
	boss_shuhun: {
		trigger: {
			source: 'damageSource',
		},
		forced: true,
		filter(event, player) {
			return game.hasPlayer((current) => {
				return current.isFriendsOf(player) && current.isDamaged();
			});
		},
		logTarget(event, player) {
			return game
				.filterPlayer((current) => {
					return current.isFriendsOf(player) && current.isDamaged();
				})
				.randomGet();
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			await target.recover();
		},
	},
	boss_yingji: {
		enable: 'phaseUse',
		usable: 1,
		filterCard: true,
		selectCard: -1,
		ignoreMod: true,
		viewAs: {
			name: 'sha',
		},
		async precontent(event, trigger, player) {
			delete event.result.skill;
			const cards = event.result.cards;
			await player.showCards(cards);
			event.result.cards = [];
			event.result.card = new lib.element.VCard({ name: 'sha' });
			player
				.when('useCard1')
				.filter((evt) => evt.parent == event.parent)
				.step(async (event, trigger, player) => {
					trigger.baseDamage = cards.map((card) => get.type2(card)).toUniqued().length;
				});
		},
		ai: {
			order: 9,
		},
	},
	boss_zhene: {
		trigger: {
			player: 'useCardToPlayered',
		},
		filter(event, player) {
			return event.target.countCards('h') <= player.countCards('h');
		},
		forced: true,
		logTarget: 'target',
		async content(event, trigger, player) {
			trigger.parent.directHit.add(trigger.target);
		},
	},
	boss_weizhu: {
		trigger: {
			global: 'damageBegin4',
		},
		filter(event, player) {
			return player.countCards('h') && event.player.isFriendsOf(player);
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseToDiscard(get.prompt2(event.skill, trigger.player), 'h')
				.set('chooseonly', true)
				.set('eff', get.damageEffect(trigger.player, trigger.source ?? trigger.player, player))
				.set('ai', (card) => {
					const { eff } = get.event();
					if (eff >= 0) {
						return 0;
					}
					return 7 - get.value(card);
				})
				.forResult();
			event.result.targets = [trigger.player];
		},
		async content(event, trigger, player) {
			const { cards } = event;
			await player.modedDiscard(cards);
			trigger.cancel();
		},
	},
	boss_qixian: {
		trigger: {
			player: 'gainAfter',
			global: ['loseAfter', 'loseAsyncAfter'],
		},
		getIndex(event, player) {
			if (!event.getg) {
				return false;
			}
			return event.getg(player);
		},
		filter(event, player) {
			return player.isPhaseUsing();
		},
		forced: true,
		async content(event, trigger, player) {
			player
				.when('useCard1')
				.filter((evt) => evt.card?.name == 'sha')
				.step(async (event, trigger, player) => {
					trigger.baseDamage ??= 1;
					trigger.baseDamage++;
				});
		},
	},
	boss_jinggong: {
		trigger: {
			player: 'phaseEnd',
		},
		forced: true,
		filter(event, player) {
			return !player.hasHistory('useCard', (evt) => evt?.card?.name == 'sha');
		},
		async content(event, trigger, player) {
			await player.loseHp();
		},
		mod: {
			targetInRange(card, player) {
				if (card.name == 'sha') {
					return true;
				}
			},
		},
	},
	boss_beishi: {
		trigger: {
			global: 'damageSource',
		},
		forced: true,
		filter(event, player) {
			if (event.player.isFriendsOf(player)) {
				return false;
			}
			return event.source?.isFriendsOf(player) && event.source != player;
		},
		logTarget: 'source',
		async content(event, trigger, player) {
			await player.draw();
		},
	},
	boss_hanjun: {
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return game.hasPlayer((current) => {
				return !current.isFriendsOf(player) && current.countDiscardableCards(player, 'he');
			});
		},
		filterTarget(card, player, target) {
			return !target.isFriendsOf(player) && target.countDiscardableCards(player, 'he');
		},
		selectTarget: -1,
		async content(event, trigger, player) {
			const cards = event.target.getDiscardableCards(player, 'he');
			if (cards?.length) {
				const card = cards.randomGet();
				await event.target.modedDiscard(card, player);
				event.parent.hanjunCards ??= [];
				event.parent.hanjunCards.add(card);
			}
		},
		async contentAfter(event, trigger, player) {
			const cards = event.parent.hanjunCards;
			if (cards.length) {
				const equips = cards.filter((card) => get.type(card) == 'equip'),
					noequips = cards.filter((card) => get.type(card) != 'equip');
				const result =
					equips.length && noequips.length
						? await player
								.chooseControl('装备牌', '非装备牌')
								.set('choiceList', [`获得${get.translation(equips)}`, `获得${get.translation(noequips)}`])
								.set('prompt', '撼军:请选择获得的类型')
								.set('ai', () => get.event().resultx)
								.set('resultx', equips.length > noequips.length ? 0 : 1)
								.forResult()
						: {
								index: equips.length ? 0 : 1,
							};
				if (result.index == 0) {
					await player.gain(equips, 'gain2');
				} else {
					await player.gain(noequips, 'gain2');
				}
			}
		},
	},
	boss_pigua: {
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		filter(event, player) {
			return !player.countCards('e');
		},
		forced: true,
		async content(event, trigger, player) {
			await player.loseHp();
			const card = get.cardPile((card) => get.type(card) == 'equip');
			if (card) {
				await player.gain(card, 'gain2');
			}
		},
	},
	boss_zhengji: {
		trigger: {
			global: ['loseAfter', 'loseAsyncAfter'],
		},
		getIndex(event, player) {
			if (!event.getl || event.type != 'discard') {
				return [];
			}
			return game
				.filterPlayer((current) => current.isFriendsOf(player))
				.reduce((cards, current) => {
					const equips = event.getl(current)?.es;
					if (equips?.length) {
						cards.addArray(equips);
					}
					return cards;
				}, []);
		},
		logTarget(event, player) {
			return game.filterPlayer((current) => current.isFriendsOf(player));
		},
		forced: true,
		async content(event, trigger, player) {
			await game.asyncDraw(event.targets);
		},
	},
	boss_xiaorui: {
		trigger: { global: 'damageSource' },
		forced: true,
		logTarget: 'source',
		filter(event, player) {
			var target = event.source;
			return target && target == _status.currentPhase && target.isAlive() && target.isFriendsOf(player) && event.card && event.card.name == 'sha' && event.parent.type == 'card';
		},
		content() {
			var source = trigger.source;
			source.addTempSkill('boss_xiaorui2');
			source.addMark('boss_xiaorui2', 1, false);
		},
	},
	boss_xiaorui2: {
		charlotte: true,
		mod: {
			cardUsable(card, player, num) {
				if (card.name == 'sha') {
					return num + player.countMark('boss_xiaorui2');
				}
			},
		},
	},
	boss_huchen: {
		trigger: {
			player: 'phaseDrawBegin2',
			source: 'dieAfter',
		},
		forced: true,
		filter(event, player) {
			if (event.name == 'die') {
				return event.player.isEnemiesOf(player);
			}
			return !event.numFixed && player.countMark('boss_huchen') > 0;
		},
		content() {
			if (trigger.name == 'die') {
				player.addMark('boss_huchen', 1);
			} else {
				trigger.num += player.countMark('boss_huchen');
			}
		},
		intro: {
			content: '已斩杀过$名敌将',
		},
	},
	boss_fengjian: {
		trigger: { source: 'damageSource' },
		forced: true,
		filter(event, player) {
			return event.player.isAlive();
		},
		logTarget: 'player',
		content() {
			trigger.player.addTempSkill('boss_fengjian2', { player: 'phaseAfter' });
			trigger.player.markAuto('boss_fengjian2', [player]);
		},
	},
	boss_fengjian2: {
		intro: {
			content: '不能对$使用牌',
		},
		mod: {
			playerEnabled(card, player, target) {
				if (player.getStorage('boss_fengjian2').includes(target)) {
					return false;
				}
			},
		},
	},
	boss_keding: {
		trigger: { player: 'useCard2' },
		forced: true,
		filter(event, player) {
			if (!event.targets || event.targets.length != 1) {
				return false;
			}
			var card = event.card;
			if (card.name != 'sha' && get.type(card) != 'trick') {
				return false;
			}
			var info = get.info(card);
			if (info.allowMultiple == false) {
				return false;
			}
			if (!player.countCards('h')) {
				return false;
			}
			if (!info.multitarget) {
				if (
					game.hasPlayer(function (current) {
						return !event.targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && lib.filter.targetInRange(card, player, current);
					})
				) {
					return true;
				}
			}
			return false;
		},
		content() {
			'step 0';
			var card = trigger.card;
			var prompt2 = '弃置任意张手牌,并为' + get.translation(card) + '增加等量的目标';
			var targets = game.filterPlayer(function (current) {
				return !trigger.targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && lib.filter.targetInRange(card, player, current);
			});
			var max = 0;
			if (!trigger.targets[0].hasSkill('heiguangkai_skill')) {
				max = targets.filter(function (target) {
					return get.effect(target, card, player, player) > 0;
				}).length;
			}
			player.chooseCardTarget({
				prompt: get.prompt('boss_keding'),
				prompt2: prompt2,
				selectCard() {
					var player = _status.event.player;
					var targets = _status.event.targets;
					return [Math.max(1, ui.selected.targets.length), Math.min(targets.length, player.countCards('h'))];
				},
				selectTarget() {
					return ui.selected.cards.length;
				},
				position: 'h',
				filterCard: lib.filter.cardDiscardable,
				filterTarget(card, player, target) {
					return _status.event.targets.includes(target);
				},
				targets: targets,
				ai1(card) {
					if (ui.selected.cards.length >= _status.event.max) {
						return 0;
					}
					return 5 - get.value(card);
				},
				ai2(target) {
					if (target.hasSkill('heiguangkai_skill')) {
						return 0;
					}
					var trigger = _status.event.getTrigger();
					var player = _status.event.player;
					return get.effect(target, trigger.card, player, player);
				},
				max: max,
				allowChooseAll: true,
			});
			('step 1');
			if (result.bool) {
				player.discard(result.cards);
				trigger.targets.addArray(result.targets);
			}
		},
	},
	boss_bashi: {
		filter(event, player) {
			return event.player != player && event.card && (event.card.name == 'sha' || get.type(event.card) == 'trick') && !player.isTurnedOver();
		},
		logTarget: 'player',
		check(event, player) {
			if (event.parent.excluded.includes(player)) {
				return false;
			}
			if (get.attitude(player, event.player) > 0) {
				return false;
			}
			if (get.tag(event.card, 'respondSha')) {
				if (player.countCards('h', { name: 'sha' }) == 0) {
					return true;
				}
			} else if (get.tag(event.card, 'respondShan')) {
				if (player.countCards('h', { name: 'shan' }) == 0) {
					return true;
				}
			} else if (get.tag(event.card, 'damage')) {
				if (event.card.name == 'shuiyanqijunx') {
					return player.countCards('e') < 2;
				}
				return true;
				//if(player.countCards('h')<2) return true;
			}
			return false;
		},
		trigger: { target: 'useCardToTargeted' },
		content() {
			player.turnOver();
			trigger.parent.excluded.add(player);
		},
	},
	boss_danjing: {
		trigger: { global: 'dying' },
		filter(event, player) {
			return player.hp > 1 && event.player.hp < 1 && event.player.isFriendsOf(player);
		},
		check(event, player) {
			var target = event.player;
			return get.attitude(player, target) > 0 && lib.filter.cardSavable({ name: 'tao' }, player, target);
		},
		logTarget: 'player',
		content() {
			'step 0';
			player.loseHp();
			('step 1');
			var card = { name: 'tao' };
			if (lib.filter.cardSavable(card, player, trigger.player)) {
				player.useCard(card, trigger.player);
			}
		},
	},
	boss_jiaoxie: {
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return lib.skill.boss_jiaoxie.filterTarget(null, player, current);
			});
		},
		filterTarget(card, player, target) {
			return target.isEnemiesOf(player) && target.type == 'mech' && target.countCards('he') > 0;
		},
		content() {
			'step 0';
			if (!target.countCards('he')) {
				event.finish();
			} else {
				target.chooseCard('he', true, '将一张牌交给' + get.translation(player));
			}
			('step 1');
			if (result.bool) {
				player.gain(result.cards, target, 'give');
			}
		},
		ai: {
			order: 9,
			result: {
				target(player, target) {
					if (
						target.countCards('e', function (card) {
							return get.value(card, target) <= 0;
						}) > 0
					) {
						return 1;
					}
					return -1;
				},
			},
		},
	},
	boss_didongjg: {
		trigger: { player: 'phaseEnd' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_didongjg'), function (card, player, target) {
				return target.isEnemiesOf(player);
			}).ai = function (target) {
				var att = get.attitude(player, target);
				if (target.isTurnedOver()) {
					if (att > 0) {
						return att + 5;
					}
					return -1;
				}
				if (player.isTurnedOver()) {
					return 5 - att;
				}
				return -att;
			};
			('step 1');
			if (result.bool) {
				result.targets[0].turnOver();
			}
		},
		ai: {
			threaten: 1.7,
		},
	},
	boss_lianyujg: {
		trigger: { player: 'phaseEnd' },
		content() {
			'step 0';
			event.players = game.filterPlayer(function (current) {
				return current.isEnemiesOf(player);
			});
			('step 1');
			if (event.players.length) {
				var current = event.players.shift();
				player.line(current, 'fire');
				current.damage('fire');
				event.redo();
			}
		},
		ai: {
			threaten: 2,
		},
	},
	boss_mojianjg: {
		trigger: { player: 'phaseUseBegin' },
		content() {
			var list = game.filterPlayer(function (current) {
				return player.canUse('wanjian', current) && current.isEnemiesOf(player);
			});
			list.sort(lib.sort.seat);
			player.useCard({ name: 'wanjian' }, list);
		},
		ai: {
			threaten: 1.8,
		},
	},
	boss_qiwu: {
		audio: true,
		trigger: { player: 'useCard' },
		forced: true,
		filter(event, player) {
			if (event.card.suit == 'club') {
				return game.hasPlayer(function (current) {
					return current.isFriendsOf(player) && current.isDamaged();
				});
			}
			return false;
		},
		content() {
			'step 0';
			var noneed = trigger.card.name == 'tao' && trigger.targets[0] == player && player.hp == player.maxHp - 1;
			player.chooseTarget(get.prompt('boss_qiwu'), function (card, player, target) {
				return target.hp < target.maxHp && target.isFriendsOf(player);
			}).ai = function (target) {
				var num = get.attitude(player, target);
				if (num > 0) {
					if (noneed && player == target) {
						num = 0.5;
					} else if (target.hp == 1) {
						num += 3;
					} else if (target.hp == 2) {
						num += 1;
					}
				}
				return num;
			};
			('step 1');
			if (result.bool) {
				result.targets[0].recover();
			}
		},
		ai: {
			expose: 0.3,
			threaten: 1.5,
		},
	},
	boss_tianyujg: {
		audio: true,
		trigger: { player: 'phaseEnd' },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current.isEnemiesOf(player) && !current.isLinked();
			});
		},
		content() {
			'step 0';
			event.targets = game.filterPlayer();
			event.targets.sort(lib.sort.seat);
			('step 1');
			if (event.targets.length) {
				var target = event.targets.shift();
				if (!target.isLinked() && target.isEnemiesOf(player)) {
					player.line(target, 'green');
					target.link();
				}
				event.redo();
			}
		},
	},
	boss_jueji: {
		audio: 2,
		trigger: { global: 'phaseDrawBegin' },
		filter(event, player) {
			if (event.player.isFriendsOf(player)) {
				return false;
			}
			return event.num > 0 && event.player != player && event.player.hp < event.player.maxHp;
		},
		logTarget: 'player',
		content() {
			player.line(trigger.player, 'green');
			trigger.num--;
		},
		ai: {
			expose: 0.2,
			threaten: 1.4,
		},
	},
	boss_huodi: {
		audio: 2,
		trigger: { player: 'phaseEnd' },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current.isFriendsOf(player) && current.isTurnedOver();
			});
		},
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_huodi'), function (card, player, target) {
				return !target.isFriendsOf(player);
			}).ai = function (target) {
				if (target.isTurnedOver()) {
					return 0;
				}
				return -get.attitude(player, target);
			};
			('step 1');
			if (result.bool) {
				result.targets[0].turnOver();
			}
		},
		ai: {
			expose: 0.2,
		},
	},
	boss_chuanyun: {
		audio: true,
		trigger: { player: 'phaseEnd' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_chuanyun'), function (card, player, target) {
				return player.hp < target.hp;
			}).ai = function (target) {
				return get.damageEffect(target, player, player);
			};
			('step 1');
			if (result.bool) {
				result.targets[0].damage();
			}
		},
	},
	boss_leili: {
		audio: 2,
		trigger: { source: 'damageEnd' },
		forced: true,
		filter(event, player) {
			return event.card && event.card.name == 'sha';
		},
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_leili'), function (card, player, target) {
				if (target == trigger.player) {
					return false;
				}
				return target.isEnemiesOf(player);
			}).ai = function (target) {
				return get.damageEffect(target, player, player, 'thunder');
			};
			('step 1');
			if (result.bool) {
				result.targets[0].damage('thunder');
			}
		},
		ai: {
			expose: 0.2,
			threaten: 1.3,
		},
	},
	boss_fengxing: {
		audio: true,
		trigger: { player: 'phaseBegin' },
		forced: true,
		content() {
			'step 0';
			player.chooseTarget(get.prompt('boss_fengxing'), function (card, player, target) {
				if (target.isFriendsOf(player)) {
					return false;
				}
				return lib.filter.targetEnabled({ name: 'sha' }, player, target);
			}).ai = function (target) {
				return get.effect(target, { name: 'sha' }, player);
			};
			('step 1');
			if (result.bool) {
				player.useCard({ name: 'sha' }, result.targets, false);
			}
		},
		ai: {
			expose: 0.2,
			threaten: 1.3,
		},
	},
	boss_xuanlei: {
		audio: true,
		trigger: { player: 'phaseBegin' },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current.isEnemiesOf(player) && current.countCards('j');
			});
		},
		content() {
			'step 0';
			event.targets = game.filterPlayer(function (current) {
				return current.isEnemiesOf(player) && current.countCards('j');
			});
			event.targets.sort(lib.sort.seat);
			player.line(event.targets, 'thunder');
			('step 1');
			if (event.targets.length) {
				event.targets.shift().damage('thunder');
				event.redo();
			}
		},
	},
	boss_fanshi: {
		audio: true,
		trigger: { player: 'phaseEnd' },
		forced: true,
		check() {
			return false;
		},
		content() {
			player.loseHp();
		},
	},
	boss_skonghun: {
		audio: true,
		trigger: { player: 'phaseUseBegin' },
		filter(event, player) {
			var num = player.maxHp - player.hp;
			if (num == 0) {
				return false;
			}
			for (const i of game.players) {
				if (i.side != player.side) {
					num--;
				}
			}
			return num >= 0;
		},
		forced: true,
		content() {
			'step 0';
			var targets = game.filterPlayer(function (current) {
				return current.isEnemiesOf(player);
			});
			targets.sort(lib.sort.seat);
			event.targets = targets;
			player.line(targets, 'thunder');
			event.num = targets.length;
			('step 1');
			if (event.targets.length) {
				event.targets.shift().damage('thunder');
				event.redo();
			}
			('step 2');
			player.recover(event.num);
		},
		ai: {
			threaten(player, target) {
				if (target.hp == 1) {
					return 2;
				}
				if (target.hp == 2 && game.players.length < 8) {
					return 1.5;
				}
				return 0.5;
			},
		},
	},
	boss_chiying: {
		audio: 2,
		trigger: { global: 'damageBegin4' },
		forced: true,
		filter(event, player) {
			if (event.num <= 1) {
				return false;
			}
			return event.player.isFriendsOf(player);
		},
		content() {
			trigger.num = 1;
		},
	},
	boss_jingfan: {
		global: 'boss_jingfan2',
	},
	boss_jingfan2: {
		mod: {
			globalFrom(from, to, distance) {
				if (to.isEnemiesOf(from)) {
					return;
				}
				var players = game.filterPlayer();
				for (let i = 0; i < players.length; i++) {
					if (players[i].hasSkill('boss_jingfan') && players[i].isFriendsOf(from) && players[i] != from) {
						return distance - 1;
					}
				}
			},
		},
	},
	boss_lingyu: {
		trigger: { player: 'phaseEnd' },
		check(event, player) {
			if (player.isTurnedOver()) {
				return true;
			}
			var num = 0,
				players = game.filterPlayer();
			for (let i = 0; i < players.length; i++) {
				if (players[i].hp < players[i].maxHp && players[i].isFriendsOf(player) && get.recoverEffect(players[i]) > 0) {
					if (players[i].hp == 1) {
						return true;
					}
					num++;
					if (num >= 2) {
						return true;
					}
				}
			}
			return false;
		},
		content() {
			'step 0';
			player.turnOver();
			('step 1');
			var list = game.filterPlayer(function (current) {
				return current.isDamaged() && current.isFriendsOf(player);
			});
			player.line(list, 'green');
			event.targets = list;
			('step 2');
			if (event.targets.length) {
				event.targets.shift().recover();
				event.redo();
			}
		},
		ai: {
			threaten: 1.5,
		},
	},
	boss_zhenwei: {
		global: 'boss_zhenwei2',
		ai: {
			threaten: 1.5,
		},
	},
	boss_zhenwei2: {
		mod: {
			globalTo(from, to, distance) {
				if (to.isFriendsOf(from)) {
					return;
				}
				var players = game.filterPlayer();
				for (let i = 0; i < players.length; i++) {
					if (players[i].hasSkill('boss_zhenwei') && players[i].isFriendsOf(to) && players[i] != to) {
						return distance + 1;
					}
				}
			},
		},
	},
	boss_benlei: {
		mode: ['versus'],
		trigger: { player: 'phaseBegin' },
		forced: true,
		filter(event, player) {
			if (_status.mode != 'jiange') {
				return false;
			}
			var players = game.filterPlayer();
			for (let i = 0; i < players.length; i++) {
				if (players[i].type == 'mech' && players[i].isEnemiesOf(player)) {
					return true;
				}
			}
		},
		content() {
			var target = game.findPlayer(function (current) {
				return current.type == 'mech' && current.isEnemiesOf(player);
			});
			if (target) {
				player.line(target, 'thunder');
				target.damage(Math.random() > 0.4 ? 2 : 3, 'thunder');
			}
		},
		ai: {
			threaten(player, target) {
				if (_status.mode == 'jiange') {
					for (const i of game.players) {
						if (i.type == 'mech' && i.isEnemiesOf(target)) {
							return 2;
						}
					}
				}
				return 1;
			},
		},
	},
	boss_nailuo: {
		trigger: { player: 'phaseEnd' },
		check(event, player) {
			if (player.isTurnedOver()) {
				return true;
			}
			var num = 0,
				players = game.filterPlayer();
			for (let i = 0; i < players.length; i++) {
				if (players[i].isEnemiesOf(player)) {
					var es = players[i].getCards('e');
					for (var j = 0; j < es.length; j++) {
						switch (get.subtype(es[j])) {
							case 'equip1':
								num += 1;
								break;
							case 'equip2':
								num += 2;
								break;
							case 'equip3':
								num += 2;
								break;
							case 'equip4':
								num += 1;
								break;
							case 'equip5':
								num += 1.5;
								break;
						}
					}
				}
			}
			if (_status.mode == 'jiange') {
				for (let i = 0; i < players.length; i++) {
					if (players[i].isFriendsOf(player) && players[i].hasSkill('huodi')) {
						return num > 0;
					}
				}
			}
			return num >= 4;
		},
		filter(event, player) {
			var players = game.filterPlayer();
			for (let i = 0; i < players.length; i++) {
				if (players[i].isEnemiesOf(player) && players[i].countCards('e')) {
					return true;
				}
			}
			return false;
		},
		content() {
			'step 0';
			player.turnOver();
			('step 1');
			event.targets = get.players();
			('step 2');
			if (event.targets.length) {
				var current = event.targets.shift();
				if (current.isEnemiesOf(player)) {
					var es = current.getCards('e');
					if (es.length) {
						current.discard(es);
						player.line(current, 'green');
					}
				}
				event.redo();
			}
		},
	},
	boss_tanshi: {
		trigger: { player: 'phaseEnd' },
		forced: true,
		check() {
			return false;
		},
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		content() {
			player.chooseToDiscard('h', true);
		},
	},
	boss_tunshi: {
		trigger: { player: 'phaseBegin' },
		forced: true,
		filter(event, player) {
			var nh = player.countCards('h');
			return game.hasPlayer(function (current) {
				return current.isEnemiesOf(player) && current.countCards('h') > nh;
			});
		},
		content() {
			'step 0';
			var nh = player.countCards('h');
			var targets = game.filterPlayer(function (current) {
				return current.isEnemiesOf(player) && current.countCards('h') > nh;
			});
			targets.sort(lib.sort.seat);
			event.targets = targets;
			('step 1');
			if (event.targets.length) {
				var current = event.targets.shift();
				current.damage();
				player.line(current, 'thunder');
				event.redo();
			}
		},
	},
	boss_jiguan: {
		mod: {
			targetEnabled(card, player, target) {
				if (card.name == 'lebu') {
					return false;
				}
			},
		},
	},
	boss_gongshenjg: {
		audio: 2,
		trigger: { player: 'phaseEnd' },
		mode: ['versus'],
		filter(event, player) {
			if (_status.mode != 'jiange') {
				return false;
			}
			var players = game.filterPlayer();
			for (let i = 0; i < players.length; i++) {
				if (players[i].type == 'mech') {
					if (players[i].isEnemiesOf(player)) {
						return true;
					}
					if (players[i].hp < players[i].maxHp) {
						return true;
					}
				}
			}
			return false;
		},
		content() {
			var enemy,
				players = game.filterPlayer();
			for (let i = 0; i < players.length; i++) {
				if (players[i].type == 'mech') {
					if (players[i].isFriendsOf(player)) {
						if (players[i].hp < players[i].maxHp) {
							player.line(players[i], 'green');
							players[i].recover();
							return;
						}
					} else {
						enemy = players[i];
					}
				}
			}
			if (enemy) {
				player.line(enemy, 'fire');
				enemy.damage('fire');
			}
		},
	},
	boss_jingmiao: {
		trigger: { global: 'useCardAfter' },
		filter(event, player) {
			return event.player.isEnemiesOf(player) && event.card.name == 'wuxie';
		},
		logTarget: 'player',
		check(event, player) {
			return get.attitude(player, event.player) < 0;
		},
		content() {
			player.line(trigger.player, 'green');
			trigger.player.loseHp();
		},
		ai: {
			expose: 0.2,
			threaten: 1.3,
		},
	},
	boss_zhinang: {
		trigger: { player: 'phaseBegin' },
		forced: true,
		content() {
			'step 0';
			event.cards = get.cards(5);
			event.cards2 = [];
			if (Array.isArray(event.cards))
				for (const i of event.cards) {
					var type = get.type(i, 'trick');
					if (type == 'trick' || type == 'equip') {
						event.cards2.push(i);
					}
				}
			if (!event.isMine() || event.cards2.length == 0) {
				player.showCards(event.cards);
			}
			('step 1');
			if (event.cards2.length == 0) {
				event.finish();
			} else {
				var dialog = ui.create.dialog('将五张牌中的锦囊牌或装备牌交给一名己方角色', 'hidden');
				dialog.add(event.cards);
				for (let i = 0; i < dialog.buttons.length; i++) {
					if (event.cards2.includes(dialog.buttons[i].link)) {
						dialog.buttons[i].style.opacity = 1;
					} else {
						dialog.buttons[i].style.opacity = 0.5;
					}
				}
				var next = player.chooseTarget(true, dialog, function (card, player, target) {
					return target.isFriendsOf(player);
				});
				next.ai = function (target) {
					var att = get.attitude(player, target);
					if (att > 0 && target.hasJudge('lebu')) {
						return 0.1;
					}
					if (player.countCards('h') > player.hp) {
						if (target == player) {
							return Math.max(1, att - 2);
						}
					}
					if (target == player) {
						return att + 5;
					}
					return att;
				};
			}
			('step 2');
			if (result && result.targets && result.targets.length) {
				event.target = result.targets[0];
			}
			if (event.cards2.length) {
				player.line(event.target, 'green');
				event.target.gain(event.cards2, 'gain2', 'log');
			}
		},
		ai: {
			threaten: 1.3,
		},
	},
	boss_biantian4: {
		trigger: { player: 'dieBegin' },
		forced: true,
		popup: false,
		content() {
			for (const i of game.players) {
				if (i.hasSkill('boss_biantian3')) {
					i.removeSkill('boss_biantian3');
					i.popup('boss_biantian3');
				}
				if (i.hasSkill('boss_biantian2')) {
					i.removeSkill('boss_biantian2');
					i.popup('boss_biantian2');
				}
			}
		},
	},
	boss_biantian: {
		trigger: { player: 'phaseBegin' },
		forced: true,
		group: 'boss_biantian4',
		content() {
			'step 0';
			for (const i of game.players) {
				if (i.hasSkill('boss_biantian3')) {
					i.removeSkill('boss_biantian3');
					i.popup('boss_biantian3');
				}
				if (i.hasSkill('boss_biantian2')) {
					i.removeSkill('boss_biantian2');
					i.popup('boss_biantian2');
				}
			}
			player.judge(function (card) {
				var color = get.color(card);
				if (color == 'black') {
					return 1;
				}
				if (color == 'red') {
					return 0;
				}
				return -1;
			});
			('step 1');
			var targets = [],
				players = game.filterPlayer();
			if (result.color == 'red') {
				game.trySkillAudio('boss_biantianx2');
				for (let i = 0; i < players.length; i++) {
					if (!players[i].isFriendsOf(player)) {
						players[i].addSkill('boss_biantian3');
						players[i].popup('kuangfeng');
						targets.push(players[i]);
					}
				}
			} else if (result.color == 'black') {
				game.trySkillAudio('boss_biantianx1');
				for (let i = 0; i < players.length; i++) {
					if (players[i].isFriendsOf(player)) {
						players[i].addSkill('boss_biantian2');
						players[i].popup('dawu');
						targets.push(players[i]);
					}
				}
			}
		},
		ai: {
			threaten: 1.6,
		},
	},
	boss_biantian2: {
		trigger: { player: 'damageBefore' },
		filter(event, player) {
			if (!event.hasNature('thunder')) {
				return true;
			}
			return false;
		},
		forced: true,
		mark: true,
		marktext: '雾',
		intro: {
			content: '已获得大雾标记',
		},
		content() {
			trigger.cancel();
		},
		ai: {
			nofire: true,
			nodamage: true,
			effect: {
				target(card, player, target, current) {
					if (get.tag(card, 'damage') && !get.tag(card, 'thunderDamage')) {
						return 'zeroplayertarget';
					}
				},
			},
		},
	},
	boss_biantian3: {
		trigger: { player: 'damageBegin3' },
		filter(event, player) {
			if (event.hasNature('fire')) {
				return true;
			}
			return false;
		},
		mark: true,
		marktext: '风',
		intro: {
			content: '已获得狂风标记',
		},
		forced: true,
		content() {
			trigger.num++;
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (get.tag(card, 'fireDamage')) {
						return 1.5;
					}
				},
			},
		},
	},
	boss_jizhen: {
		audio: 2,
		trigger: { player: 'phaseEnd' },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current.isFriendsOf(player) && current.isDamaged();
			});
		},
		content() {
			var list = game.filterPlayer(function (current) {
				return current.isFriendsOf(player) && current.isDamaged();
			});
			if (list.length) {
				player.line(list, 'green');
				game.asyncDraw(list);
			}
		},
		ai: {
			threaten: 1.4,
		},
	},
	boss_lingfeng: {
		audio: 2,
		trigger: { player: 'phaseDrawBefore' },
		content() {
			'step 0';
			trigger.cancel();
			event.cards = get.cards(2);
			player.showCards(event.cards);
			('step 1');
			if (get.color(event.cards[0]) != get.color(event.cards[1])) {
				player.chooseTarget('是否令一名敌方角色失去1点体力？', function (card, player, target) {
					return !target.isFriendsOf(player);
				}).ai = function (target) {
					return -get.attitude(player, target);
				};
			}
			('step 2');
			if (result.bool && result.targets && result.targets.length) {
				player.line(result.targets, 'green');
				result.targets[0].loseHp();
			}
			('step 3');
			player.gain(event.cards);
			player.$draw(event.cards);
		},
		ai: {
			threaten: 1.4,
		},
	},
	boss_yuhuojg: {
		audio: true,
		trigger: { player: 'damageBegin2' },
		filter(event, player) {
			return event.hasNature('fire');
		},
		forced: true,
		content() {
			trigger.cancel();
		},
		ai: {
			nofire: true,
			effect: {
				target(card, player, target, current) {
					if (get.tag(card, 'fireDamage')) {
						return 'zeroplayertarget';
					}
				},
			},
		},
	},
	boss_tianyun: {
		trigger: { player: 'phaseEnd' },
		forced: true,
		content() {
			'step 0';
			event.forceDie = true;
			player.chooseTarget(get.prompt('boss_tianyun'), function (card, player, target) {
				return target.isEnemiesOf(player);
			}).ai = function (target) {
				if (player.hp <= 1) {
					return 0;
				}
				if (get.attitude(player, target) > -3) {
					return 0;
				}
				var eff = get.damageEffect(target, player, player, 'fire');
				if (eff > 0) {
					return eff + target.countCards('e') / 2;
				}
				return 0;
			};
			('step 1');
			if (result.bool) {
				player.loseHp();
				event.target = result.targets[0];
			} else {
				event.finish();
			}
			('step 2');
			if (event.target) {
				event.target.damage(Math.random() > 0.4 ? 2 : 3, 'fire');
			}
			('step 3');
			if (event.target) {
				var es = event.target.getCards('e');
				if (es.length) {
					event.target.discard(es);
				}
			}
		},
		ai: {
			threaten: 2,
		},
	},
	versus_ladder: {
		trigger: { global: ['damageEnd', 'recoverEnd', 'dieEnd', 'gainEnd', 'phaseDiscardEnd'] },
		silent: true,
		filter(event, player) {
			if (!_status.ladder) {
				return false;
			}
			if (event._ladder_mmr_counted) {
				return false;
			}
			if (!event.source) {
				return false;
			}
			return event.source == game.me || event.player == game.me;
		},
		content() {
			switch (event.triggername) {
				case 'damageEnd': {
					if (trigger.source.side != trigger.player.side) {
						if (trigger.source == game.me) {
							_status.ladder_mmr += 0.5 * Math.max(1, trigger.num);
						} else {
							_status.ladder_mmr += 0.2 * Math.max(1, trigger.num);
						}
					}
					break;
				}
				case 'recoverEnd': {
					if (trigger.source != trigger.player) {
						if (trigger.source == game.me) {
							if (trigger.player.side == game.me.side) {
								_status.ladder_mmr += 0.5 * trigger.num;
							} else {
								_status.ladder_mmr -= 0.3 * trigger.num;
							}
						}
					} else {
						_status.ladder_mmr += 0.3 * trigger.num;
					}
					break;
				}
				case 'dieEnd': {
					if (trigger.source == game.me && trigger.player.side != game.me.side) {
						_status.ladder_mmr += 2;
					}
					break;
				}
				case 'gainEnd': {
					if (trigger.cards && trigger.cards.length) {
						if (trigger.source == game.me && trigger.player != game.me) {
							if (trigger.player.side == game.me.side) {
								_status.ladder_mmr += 0.3 * trigger.cards.length;
							} else {
								_status.ladder_mmr -= 0.1 * trigger.cards.length;
							}
						} else {
							if (trigger.source) {
								if (trigger.source.side != game.me.side) {
									_status.ladder_mmr += 0.3 * trigger.cards.length;
								}
							} else {
								_status.ladder_mmr += 0.1 * trigger.cards.length;
							}
						}
					}
					break;
				}
				case 'phaseDiscardEnd': {
					if (trigger.player == player) {
						if (trigger.cards && trigger.cards.length) {
							_status.ladder_mmr -= 0.2 * trigger.cards.length;
						}
					}
					break;
				}
			}
			trigger._ladder_mmr_counted = true;
		},
	},
	//太虚搬运
	//孟婆
	boss_aotang: {
		// audio: 'ext:夜白神略/audio/character:true',
		audio: 'ext:太虚幻境/audio/skill:true',
		trigger: {
			player: 'phaseBegin',
		},
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return player.getEnemies().includes(current);
			});
		},
		content() {
			var list = game
				.filterPlayer(function (current) {
					return player.getEnemies().includes(current);
				})
				.randomGet();
			player.line(list);
			list.addSkill('boss_aotang_fengyin');
		},
		group: 'boss_aotang_delete',
		subSkill: {
			delete: {
				trigger: {
					player: ['phaseBegin', 'dieBegin'],
				},
				forced: true,
				_priority: 20,
				forced: true,
				content() {
					game.countPlayer(function (current) {
						if (current.hasSkill('boss_aotang_fengyin')) {
							current.removeSkill('boss_aotang_fengyin');
						}
					});
				},
			},
			fengyin: {
				charlotte: true,
				init(player, skill) {
					player.addSkillBlocker(skill);
				},
				onremove(player, skill) {
					player.removeSkillBlocker(skill);
				},
				skillBlocker(skill, player) {
					return skill != 'boss_aotang_fengyin' && !lib.skill[skill].charlotte;
				},
				mark: true,
				intro: {
					name: '熬汤',
					content(storage, player, skill) {
						var str = '无失效技能';
						var list = player.getSkills(null, false, false).filter(function (i) {
							return lib.skill.boss_aotang_fengyin.skillBlocker(i, player);
						});
						if (list.length) {
							str = '失效技能:' + get.translation(list);
						}
						return str;
					},
				},
			},
		},
	},
	boss_guimeic: {
		// audio: 'ext:夜白神略/audio/character:true',
		audio: 'ext:太虚幻境/audio/skill:true',
		group: ['boss_guimeic_draw', 'boss_guimeic_use'],
		trigger: {
			player: 'turnOverBefore',
		},
		_priority: 20,
		filter(event, player) {
			return !player.isTurnedOver();
		},
		forced: true,
		content() {
			trigger.cancel();
			game.log(player, '取消了翻面');
		},
		subSkill: {
			draw: {
				trigger: {
					player: 'phaseDrawSkipped',
				},
				forced: true,
				content() {
					player.draw();
				},
			},
			use: {
				trigger: {
					player: 'phaseUseSkipped',
				},
				forced: true,
				content() {
					player.addTempSkill('boss_guimeic_xiaoguo');
				},
			},
			xiaoguo: {
				mod: {
					ignoredHandcard(card, player) {
						return true;
					},
					cardDiscardable(card, player, name) {
						if (name == 'phaseDiscard') {
							return false;
						}
					},
				},
				forced: true,
				fixed: true,
				popup: false,
			},
		},
		ai: {
			noturn: true,
			effect: {
				target(card, player, target) {
					if (get.type(card) == 'delay') {
						return 0.5;
					}
				},
			},
		},
	},
	boss_yunjv: {
		// audio: 'ext:夜白神略/audio/character:true',
		audio: 'ext:太虚幻境/audio/skill:true',
		trigger: {
			global: 'phaseEnd',
		},
		forced: true,
		filter(event, player) {
			return player.getEnemies().includes(event.player) && event.player.countCards('he') > 0 && event.player != player;
		},
		logTarget: 'player',
		content() {
			if (trigger.player.countCards('h') > 0) {
				var card1 = trigger.player.getCards('h').randomGet();
			}
			if (trigger.player.countCards('e') > 0) {
				var card2 = trigger.player.getCards('e').randomGet();
			}
			if (trigger.player.countCards('e') > 0 && trigger.player.countCards('h') == 0) {
				trigger.player.discard(card2);
			}
			if (trigger.player.countCards('e') == 0 && trigger.player.countCards('h') > 0) {
				trigger.player.discard(card1);
			}
			if (trigger.player.countCards('e') > 0 && trigger.player.countCards('h') > 0) {
				trigger.player.discard([card1, card2]);
			}
		},
		ai: {
			expose: 0.2,
		},
	},
};
