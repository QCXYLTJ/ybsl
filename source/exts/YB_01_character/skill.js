import { lib, game, ui, get, ai, _status } from '../../../../../noname.js';
export { skill };
/** @type { importCharacterConfig.skill } */
const skill = {
	dz013_qingling: {
		inherit: 'dz014_qingling',
		audio: 'ext:夜白神略/audio/character:1',
	},
	dz013_shanwu: {
		inherit: 'dz017_shanwu',
		audio: 'ext:夜白神略/audio/character:1',
	},

	dz014_xianji: {
		audio: 'ext:夜白神略/audio/character:1',
		audioname2: {
			ybmjz_shen_caopi_kui: '',
		},
		enable: 'chooseToUse',
		filter(event, player) {
			if (!player.storage.dz014_xinkui) {
				return false;
			}
			if (event.type == 'dying') {
				if (player.storage.dz014_xinkui != event.dying) {
					return false;
				}
				return true;
			} else if (event.parent.name == 'phaseUse') {
				return true;
			}
			return false;
		},
		logTarget(event, trigger) {
			return player.storage.dz014_xinkui;
		},
		content() {
			'step 0';
			let target = player.storage.dz014_xinkui;
			event.target = target;
			event.num = _status.event.getParent(2).type == 'dying' ? 1 - _status.event.getParent(2).dying.hp : player.hp;
			('step 1');
			target.gainMaxHp(player.maxHp);
			if (event.num > 0) {
				target.recover(event.num);
			}
			('step 2');
			const next = player.die();
			if (_status.event.getParent(2).type == 'dying') {
				event.next.remove(next);
				_status.event.getParent(2).after.push(next);
			}
		},
		ai: {
			order: 0.5,
			skillTagFilter(player, tag, target) {
				if (player.storage.dz014_xinkui != target) {
					return false;
				}
			},
			save: true,
			result: {
				player() {
					const tri = _status.event.getTrigger();
					if (tri && tri.name === 'dying') {
						return 1;
					} else {
						return -999;
					}
				},
			},
		},
	},
	dz014_yangkui: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			global: 'loseMaxHpBegin',
		},
		filter(event, player) {
			return player.storage.dz014_xinkui && player.storage.dz014_xinkui == event.player;
		},
		forced: true,
		content() {
			player.gainMaxHp(trigger.num);
		},
		group: 'dz014_yangkui_die',
		subSkill: {
			die: {
				audio: 'ext:夜白神略/audio/character:1',
				trigger: {
					player: 'phaseJieshuBegin',
				},
				filter(event, player) {
					return player.storage.dz014_xinkui && !player.storage.dz014_xinkui.isAlive();
				},
				forced: true,
				content() {
					player.die();
				},
			},
		},
	},
	dz014_shanwu: {
		inherit: 'dz017_shanwu',
		audio: 'ext:夜白神略/audio/character:1',
	},
	dz014_qingling: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		forced: true,
		trigger: {
			player: 'damageBegin4',
		},
		filter(event, player) {
			return event.num > 1;
		},
		content() {
			trigger.cancel();
			player.loseHp();
		},
		ai: {
			filterDamage: true,
		},
		mod: {
			maxHandcard(player, num) {
				return num + 1;
			},
		},
	},
	dz014_fuhua: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			player: ['useCard', 'phaseBegin'],
		},
		forced: true,
		filter(event, player) {
			if (event.name == 'phase') {
				return true;
			}
			if (get.color(event.card) == 'none') {
				return false;
			}
			return get.color(event.card) == 'black' || player.hasMark('dz014_fuhua');
		},
		content() {
			if (trigger.name == 'phase' || get.color(trigger.card) == 'black') {
				player.addMark('dz014_fuhua');
			} else {
				player.removeMark('dz014_fuhua');
			}
		},
		marktext: '腐',
		intro: {
			name: '腐',
			content: 'mark',
		},
		mod: {
			maxHandcard(player, num) {
				return num + player.countMark('dz014_fuhua');
			},
		},
	},
	dz014_xinsheng: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			player: ['phaseJieshuBegin', 'dying'],
		},
		forced: true,
		filter(event, player) {
			let num = player.countMark('dz014_fuhua');
			return num > player.maxHp && num >= 3;
		},
		content() {
			'step 0';
			let num = player.countMark('dz014_fuhua');
			player.removeMark('dz014_fuhua', num);
			player.draw(num);
			player.loseMaxHp();
			('step 1');
			let num1 = player.maxHp - player.hp;
			if (num1 > 0) {
				player.recover(num1);
			}
		},
		ai: {
			combo: 'dz014_fuhua',
		},
	},
	dz014_xinkui: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			global: 'dieAfter',
		},
		forced: true,
		filter(event, player) {
			if (!player.side) {
				player.side = player.playerid;
			}
			return !event.player.isAlive() && (!event.player.side || event.player.side != player.side);
		},
		available(mode) {
			if (['versus', 'boss', 'chess'].includes(mode)) {
				return false;
			}
		},
		logTarget: 'player',
		content() {
			game.addGlobalSkill('autoswap');
			const fun = function (self, me) {
				me = me || game.me;
				const that = this._trueMe || this;
				if (that.isMad() || game.notMe) {
					return false;
				}
				if (this === me) {
					if (self) {
						return true;
					}
					return false;
				}
				if (that === me || this == me._trueMe) {
					return true;
				}
				if (_status.connectMode) {
					return false;
				}
				if (lib.config.mode == 'versus') {
					if (_status.mode == 'three') {
						return this.side == me.side;
					}
					if (_status.mode == 'standard') {
						return lib.storage.single_control && this.side == me.side;
					}
					if (_status.mode == 'four') {
						return get.config('four_phaseswap') && this.side == me.side;
					}
					if (_status.mode == 'two') {
						return get.config('two_phaseswap') && this.side == me.side;
					}
					return false;
				} else if (lib.config.mode == 'boss') {
					if (me.side) {
						return false;
					}
					return this.side == me.side && get.config('single_control');
				} else if (game.chess) {
					if (lib.config.mode == 'chess') {
						if (_status.mode == 'combat' && !get.config('single_control')) {
							return false;
						}
					}
					return this.side == me.side;
				}
				if (this.side && this.side == me.side) {
					return true;
				}
				return false;
			};
			lib.element.player.isUnderControl = fun;
			for (const i of game.players) {
				i.isUnderControl = fun;
			}
			if (!player.side) {
				player.side = player.playerid;
			}
			trigger.player.side = player.side;
			trigger.player._trueMe = player;
			if (trigger.player == game.me) {
				game.notMe = true;
				if (!_status.auto) {
					ui.click.auto();
				}
			}
			trigger.player.init('dzsl_014xinzhikui');
			trigger.player.storage.dz014_xinkui = player;
			if (!lib.translate.commoner) {
				lib.translate.commoner = '民';
			}
			trigger.player.identity = 'commoner';
			trigger.player.setIdentity('commoner');
			trigger.player.identityShown = trigger.player.storage.dz014_xinkui.identityShown;
			trigger.player.ai.modAttitudeFrom = function (from, to, att) {
				const source = game.findPlayer((target) => target == from.side || (target.side == from.side && target.identity != 'commoner'));
				if (to == from.side || to.side == from.side) {
					return 20;
				}
				return get.attitude(source, to);
			};
			trigger.player.ai.modAttitudeTo = function (from, to, att) {
				const source = game.findPlayer((target) => target == to.side || (target.side == to.side && target.identity != 'commoner'));
				if (from == to.side || from.side == to.side) {
					return 20;
				}
				return get.attitude(from, source) * (to.identity == 'commoner' ? 0.8 : 1);
			};
			trigger.player.revive(1, false);
			trigger.player.draw(2);
		},
	},
	dz014_zaomeng: {
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			global: 'useCard',
		},
		filter(event, player) {
			if (get.color(event.card) == 'none') {
				return false;
			}
			return player.hasZhuSkill('dz014_zaomeng') && event.player != player && (get.color(event.card) == 'black' || player.hasMark('dz014_fuhua')) && event.player.group == 'YB_memory';
		},

		zhuSkill: true,
		cost() {
			let bool = get.color(trigger.card) == 'black';
			let str = '令' + get.translation(player);
			str += bool ? '获得' : '移除';
			str += '一枚<腐>标记？';
			event.bool = bool;
			event.result = trigger.player
				.chooseBool(get.prompt('dz014_zaomeng', player), str)
				.set('ai', function () {
					let att = get.attitude(_status.event.player, _status.event.parent.player);
					let bool = _status.event.bool;
					if (att > 0) {
						return bool;
					} else {
						return !bool;
					}
				})
				.set('bool', bool)
				.forResult();
		},
		content() {
			let bool = get.color(trigger.card) == 'black';
			if (bool) {
				player.addMark('dz014_fuhua');
			} else {
				player.removeMark('dz014_fuhua');
			}
		},
		ai: {
			combo: 'dz014_fuhua',
		},
	},

	dz015_enguang: {
		audio: 'ext:夜白神略/audio/character:1',
		zhuSkill: true,
		global: 'dz015_enguang_2',
		subSkill: {
			2: {
				audio: 'ext:夜白神略/audio/character:1',
				trigger: {
					global: 'damageBegin4',
				},
				filter(event, player) {
					return player.group == 'YB_memory' && event.player != player && event.player.hasZhuSkill('dz015_enguang') && (!event.player.storage.dz015_enguang || !event.player.storage.dz015_enguang.includes(player));
				},
				check(event, player) {
					let num = player.countCards('h', 'tao') + player.countCards('h', 'jiu') + player.hp;
					if (get.attitude(player, event.player) < 4) {
						return false;
					}
					if (event.player == game.zhu) {
						return true;
					}
					return event.num <= num;
				},
				logTarget: 'player',
				content() {
					if (!trigger.player.storage.dz015_enguang) {
						trigger.player.storage.dz015_enguang = [];
					}
					trigger.player.storage.dz015_enguang.add(player);
					trigger.cancel();
					player.damage(trigger.num, 'nosource');
				},
			},
		},
	},
	dz015_shugu: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			global: 'damageBegin1',
		},
		filter(event, player) {
			return event.source && event.player == player && player.isEmpty(2) && !event.source.isEmpty(1) && event.source != player && event.card && event.card.name == 'sha' && event.parent.name == 'sha';
		},
		forced: true,
		content() {
			trigger.num++;
		},
	},
	dz015_tianshu: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			target: 'useCardToTargeted',
		},
		filter(event, player) {
			if (get.type(event.card) != 'trick' || _status.currentPhase == player || event.player == player) {
				return false;
			}
			return !player.storage.dz015_tianshu || player.storage.dz015_tianshu != event.card.name;
		},
		content() {
			player.storage.dz015_tianshu = trigger.card.name;
			player.markSkill('dz015_tianshu');
		},
		intro: {
			content: '当前记录牌名:$',
		},
		group: 'dz015_tianshu_use',
		subSkill: {
			use: {
				audio: 'ext:夜白神略/audio/character:1',
				trigger: {
					player: 'phaseUseBegin',
				},
				forced: true,
				filter(event, player) {
					return player.storage.dz015_tianshu && player.hasUseTarget(player.storage.dz015_tianshu);
				},
				check(event, player) {
					let card = player.storage.dz015_tianshu;
					return game.hasPlayer(function (current) {
						return player.canUse(card, current) && get.effect(current, { name: card }, player, player) > 0;
					});
				},
				content() {
					player.chooseUseTarget(get.prompt('dz015_tianshu'), '视为使用一张' + get.translation(player.storage.dz015_tianshu), player.storage.dz015_tianshu);
				},
				'=': {},
			},
		},
	},
	dz015_xianzhe: {
		audio: 'ext:夜白神略/audio/character:1',
		enable: 'chooseToUse',
		filter(event, player) {
			if (player.countCards('h') < 2 || player.hasSkill('dz015_xianzhe_2')) {
				return false;
			}
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			for (const i of lib.inpile) {
				const type = get.type(i);
				if (type == 'trick' && evt({ name: i }, player, event)) {
					return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];
				for (let i = 0; i < lib.inpile.length; i++) {
					if (get.type(lib.inpile[i]) == 'trick') {
						list.push(['锦囊', '', lib.inpile[i]]);
					}
				}
				return ui.create.dialog('贤者', [list, 'vcard']);
			},
			filter(button, player) {
				return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
			},
			check(button) {
				if (_status.event.parent.type != 'phase') {
					return 1;
				}
				const player = _status.event.player;
				if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan_gai', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) {
					return 0;
				}
				return player.getUseValue({
					name: button.link[2],
					nature: button.link[3],
				});
			},
			backup(links, player) {
				return {
					filterCard: true,
					selectCard: 2,
					complexCard: true,
					position: 'h',
					audio: 'dz015_xianzhe',
					popname: true,
					viewAs: { name: links[0][2] },
					precontent() {
						player.addTempSkill('dz015_xianzhe_2');
					},
				};
			},
			prompt(links, player) {
				return '将两张手牌当作' + get.translation(links[0][2]) + '使用';
			},
		},
		hiddenCard(player, name) {
			const type = get.type(name);
			return type == 'trick' && player.countCards('h') >= 2 && !player.hasSkill('dz015_xianzhe_2');
		},
		ai: {
			fireAttack: true,
			respondSha: true,
			respondShan: true,
			skillTagFilter(player) {
				if (player.hasSkill('dz015_xianzhe_2') || player.countCards('h') < 2) {
					return false;
				}
			},
			threaten: 1.2,
			order: 1,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
		subSkill: {
			2: {
				trigger: {
					player: ['useCardAfter'],
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter(event, player) {
					return event.skill == 'dz015_xianzhe_backup';
				},
				content() {
					player.draw();
				},
			},
			backup: {},
		},
	},

	dz016_zanxu: {
		audio: 'ext:夜白神略/audio/character:1',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.countCards('h', { suit: 'heart' }) > 0;
		},
		filterTarget(card, player, target) {
			return player != target;
		},
		filterCard(card, player) {
			return card.suit == 'heart';
		},
		check(card) {
			return 8 - get.value(card);
		},
		discard: false,
		lose: false,
		delay: false,
		content() {
			'step 0';
			target.gain(cards[0], player, 'give');
			('step 1');
			const id = target.playerid;
			if (!player.storage.dz016_zanxu_buff) {
				player.storage.dz016_zanxu_buff = {};
			}
			if (typeof player.storage.dz016_zanxu_buff[id] != 'number') {
				player.storage.dz016_zanxu_buff[id] = 0;
			}
			player.storage.dz016_zanxu_buff[id]++;
			player.addSkill('dz016_zanxu_buff');
		},
		ai: {
			order: 9,
			result: {
				player: 1,
				target: 2,
			},
			threaten: 2,
		},
		subSkill: {
			buff: {
				audio: 'ext:夜白神略/audio/character:1',
				trigger: {
					global: ['recoverBegin', 'phaseAfter'],
				},
				charlotte: true,
				mark: true,
				forced: true,
				filter(event, player) {
					return player.storage.dz016_zanxu_buff && typeof player.storage.dz016_zanxu_buff[event.player.playerid] == 'number' && _status.currentPhase == event.player;
				},
				content() {
					if (trigger.name == 'recover') {
						player.draw(player.storage.dz016_zanxu_buff[trigger.player.playerid] * 2);
					}
					delete player.storage.dz016_zanxu_buff[trigger.player.playerid];
					if (
						!game.hasPlayer(function (c) {
							return typeof player.storage.dz016_zanxu_buff[c.playerid] == 'number';
						})
					) {
						player.removeSkill('dz016_zanxu_buff');
					}
				},
				intro: {
					markcount(storage) {
						let num = 0;
						if (storage) {
							for (let i in storage) {
								num++;
							}
						}
						return num;
					},
					mark(dialog, storage, player) {
						if (storage) {
							const targets = game.filterPlayer().sortBySeat();
							for (const i of targets) {
								const id = i.playerid;
								if (storage[id]) {
									dialog.addText('当' + get.translation(i) + '于其回合内第一次回复体力时你摸' + get.cnNumber(storage[id] * 2) + '张牌');
								}
							}
						} else {
							dialog.addText('暂无内容');
						}
					},
				},
			},
		},
	},
	dz016_shanwu: {
		inherit: 'dz017_shanwu',
		audio: 'ext:夜白神略/audio/character:1',
	},

	dz017_zhushi: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:3',
		logAudio: () => ['ext:夜白神略/audio/character/dz017_zhushi1'],
		trigger: {
			player: 'phaseEnd',
		},
		forced: true,
		content() {
			'step 0';
			player
				.chooseTarget(get.prompt2('dz017_zhushi'), function (card, player, target) {
					return target != player;
				})
				.set('ai', function (target) {
					return -get.attitude(_status.event.player, target);
				});
			('step 1');
			if (result.bool) {
				let target = result.targets[0];
				if (!player.storage.dz017_zhushi_buff) {
					player.storage.dz017_zhushi_buff = [];
				}
				player.storage.dz017_zhushi_buff.add(target);
				player.addTempSkill('dz017_zhushi_buff', { player: 'phaseBeginStart' });
				player.addTempSkill('dz017_zhushi_shibai', { player: 'phaseBeginStart' });
			}
		},
		derivation: ['dz017_zhushi_buff', 'dz017_zhushi_shibai'],
		subSkill: {
			buff: {
				audio: 'dz017_zhushi',
				logAudio: () => ['ext:夜白神略/audio/character/dz017_zhushi2'],
				trigger: {
					global: ['useCardToPlayered'],
				},
				filter(event, player) {
					if (event.name == 'phaseJieshu') {
						return (
							player.storage.dz017_zhushi_buff &&
							player.storage.dz017_zhushi_buff.includes(event.player) &&
							event.player.countGainableCards(player, 'he') &&
							event.player.getHistory('useCard', function (evt) {
								return evt.targets && evt.targets.includes(player);
							}).length == 0
						);
					} else {
						return player.storage.dz017_zhushi_buff && player.storage.dz017_zhushi_buff.includes(event.player) && event.player.isPhaseUsing() && event.target == player;
					}
				},
				content() {
					player.markSkill('dz017_zhushi_buff');
					if (trigger.name == 'phaseJieshu') {
						player.gainPlayerCard(trigger.player, 'he', true);
						player.loseHp();
					} else {
						const evtx = trigger.getParent('phaseUse');
						let num = trigger.player.getHistory('useCard', function (evt) {
							return evt.getParent('phaseUse') == evtx;
						}).length;
						if (num > 5) {
							num = 5;
						}
						player.draw(num);
					}
				},
				charlotte: true,

				forced: true,
				intro: {
					content: '正在注视着$',
				},
			},
			shibai: {
				logAudio: () => ['ext:夜白神略/audio/character/dz017_zhushi3'],
				trigger: {
					global: [/*'useCardToPlayered',*/ 'phaseJieshuBegin'],
				},
				filter(event, player) {
					if (event.name == 'phaseJieshu') {
						return (
							player.storage.dz017_zhushi_buff &&
							player.storage.dz017_zhushi_buff.includes(event.player) &&
							event.player.countGainableCards(player, 'he') &&
							event.player.getHistory('useCard', function (evt) {
								return evt.targets && evt.targets.includes(player);
							}).length == 0
						);
					} else {
						return player.storage.dz017_zhushi_buff && player.storage.dz017_zhushi_buff.includes(event.player) && event.player.isPhaseUsing() && event.target == player;
					}
				},
				content() {
					player.markSkill('dz017_zhushi_buff');
					if (trigger.name == 'phaseJieshu') {
						player.gainPlayerCard(trigger.player, 'he', true);
						player.loseHp();
					} else {
						const evtx = trigger.getParent('phaseUse');
						let num = trigger.player.getHistory('useCard', function (evt) {
							return evt.getParent('phaseUse') == evtx;
						}).length;
						if (num > 5) {
							num = 5;
						}
						player.draw(num);
					}
				},
				charlotte: true,
				forced: true,
				audio: 'ext:夜白神略/audio/character:1',
			},
		},
	},

	dzsl_shenhuo: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			player: 'damageBegin4',
		},
		filter(event, player) {
			return event.num > 0;
		},
		forced: true,
		content() {
			'step 0';
			event.count = Math.min(trigger.num, 9);
			('step 1');
			event.count--;
			if (!player.storage.dzsl_shennu_map) {
				player.storage.dzsl_shennu_map = [0, 0];
			}
			const info = player.storage.dzsl_shennu_map;
			if (info[0] >= 4 && info[1] >= 2 && player.storage.dzsl_shennu_discard) {
				player.draw();
				event.finish();
			} else {
				player.chooseControl('升级', '摸牌').set('prompt', '神火:升级神弩或摸一张牌');
			}
			('step 2');
			if (result.control == '升级') {
				lib.skill.dzsl_buxi.up(player);
			} else {
				player.draw();
			}
			('step 3');
			if (event.count) {
				event.goto(1);
			}
		},
	},
	dzsl_buxi: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			source: 'die',
			player: 'dyingAfter',
		},
		forced: true,
		filter(event, player) {
			return event.name == 'dying' || (event.getParent(5) && event.getParent(5).name == 'dzsl_shennu') || 'card';
		},
		up(player) {
			const next = game.createEvent('dzsl_shennu_up', false);
			next.player = player;
			next.setContent(lib.skill.dzsl_buxi.upc);
		},
		upc() {
			'step 0';
			if (!player.storage.dzsl_shennu_map) {
				player.storage.dzsl_shennu_map = [0, 0];
			}
			const info = player.storage.dzsl_shennu_map;
			let list = [];
			if (info[0] < 4) {
				list.add('X');
			}
			if (info[1] < 2) {
				list.add('Y');
			}
			if (list.length > 1) {
				player.chooseControl(list).set('prompt', '升级:选择要升级的数值');
			} else {
				if (list.length == 1) {
					event._result = { control: list[0] };
				} else {
					event.goto(2);
				}
			}
			('step 1');
			if (result.control == 'X') {
				player.storage.dzsl_shennu_map[0]++;
				game.log(player, '升级了', '#g【神弩】', '描述中的', '#gX');
			} else {
				player.storage.dzsl_shennu_map[1]++;
				game.log(player, '升级了', '#g【神弩】', '描述中的', '#gY');
			}
			event.finish();
			('step 2');
			if (!player.storage.dzsl_shennu_discard) {
				player.storage.dzsl_shennu_discard = true;
				game.log(player, '升级了【神弩】的技能效果');
			}
		},
		content() {
			'step 0';
			player.restoreSkill('dzsl_shennu');
			if (!player.storage.dzsl_shennu_map) {
				player.storage.dzsl_shennu_map = [0, 0];
			}
			const info = player.storage.dzsl_shennu_map;
			if (info[0] >= 4 && info[1] >= 2 && player.storage.dzsl_shennu_discard) {
				player.draw();
				event.finish();
			} else {
				player.chooseControl('升级', '摸牌').set('prompt', '不息:升级神弩或摸一张牌');
			}
			('step 1');
			if (result.control == '升级') {
				lib.skill.dzsl_buxi.up(player);
			} else {
				player.draw();
			}
		},
	},
	dzsl_shennu: {
		audio: 'ext:夜白神略/audio/character:1',
		enable: 'phaseUse',
		limited: true,
		filterTarget(card, player, target) {
			return player.canUse('sha', target, false);
		},
		derivation: 'dzsl_shennu_up',
		content() {
			'step 0';
			player.awakenSkill('dzsl_shennu');
			player.storage.dzsl_shennu_buff = [event, target];
			player.addTempSkill('dzsl_shennu_buff');
			const hs = player.getDiscardableCards('h');
			if (hs.length) {
				event.discard = hs.length;
				player.discard(hs);
			}
			('step 1');
			if (!player.storage.dzsl_shennu_map) {
				player.storage.dzsl_shennu_map = [0, 0];
			}
			const info = player.storage.dzsl_shennu_map;
			event.X = Math.max(1 + info[0], player.getDamagedHp());

			event.Y = Math.max(3 + info[1], game.countPlayer());

			event.count = event.X + event.Y;
			('step 2');
			event.count--;
			let card = get.cards()[0];
			const cardx = card;
			player.showCards(card);
			if (player.storage.dzsl_shennu_discard && card.name != 'sha' && event.discard > 0) {
				event.discard--;
				card = {
					name: 'sha',
					nature: 'fire',
					cards: [cardx],
					suit: cardx.suit,
					number: cardx.number,
				};
			}
			if (target.isAlive() && card.name == 'sha' && player.canUse(card, target, false)) {
				player.useCard(card, [cardx], target, false);
			} else {
				game.cardsDiscard(card);
			}
			('step 3');
			if (event.count > 0) {
				if (target.isAlive()) {
					event.goto(2);
				}
			}
		},
		subSkill: {
			buff: {
				trigger: {
					global: ['dying', 'dyingAfter'],
				},
				charlotte: true,
				forced: true,
				filter(event, player, name) {
					if (!player.storage.dzsl_shennu_buff) {
						return false;
					}
					if (event.player != player.storage.dzsl_shennu_buff[1]) {
						return false;
					}
					if (name == 'dying') {
						return player.storage.dzsl_shennu_buff[0].count != 0;
					} else {
						return event.player.isAlive();
					}
				},
				content() {
					if (event.triggername == 'dying') {
						player.storage.dzsl_shennu_buff[0].count = 0;
					} else {
						if (!player.storage.dzsl_shennu_buff2) {
							player.storage.dzsl_shennu_buff2 = [];
						}
						player.storage.dzsl_shennu_buff2.add(trigger.player);
						player.addTempSkill('dzsl_shennu_buff2');
					}
				},
			},
			buff2: {
				forced: true,
				charlotte: true,
				mark: true,
				intro: {
					content: '本回合不能对$使用牌',
				},
				mod: {
					playerEnabled(card, player, target) {
						if (player.storage.dzsl_shennu_buff2.includes(target)) {
							return false;
						}
					},
					cardSavable(card, player, target) {
						if (player.storage.dzsl_shennu_buff2.includes(target)) {
							return false;
						}
					},
				},
			},
		},
		mark: true,
		intro: {
			content: 'limited',
		},
		init(player, skill) {
			player.storage[skill] = false;
		},
	},
	dzsl_shennu_up: {},

	dz017_shanwu: {
		audio: 'ext:夜白神略/audio/character:1',

		audioname2: {
			ybsl_013yinji: 'yb013_shanwu',
			dzsl_013yinji: 'dz013_shanwu',
			dzsl_014xinzhikui: 'dz014_shanwu',
			ybart_016manchengqi: 'yb016_shanwu',
			dzsl_016manchengqi: 'dz016_shanwu',
			ybold_018zhangqing: 'yb018_shanwu',
		},
		enable: 'phaseUse',
		usable: 1,
		position: 'he',
		filterCard: true,
		selectCard: [1, Infinity],
		check(card) {
			const player = _status.event.player;
			if (ui.selected.cards && ui.selected.cards.length) {
				return 6 - get.value(card) && get.type2(card) == get.type2(ui.selected.cards[0]);
			}
			let eff = 6 - get.value(card);
			if (player.hp <= 2 && player.maxHp > 2 && get.type2(card) == 'basic') {
				eff += 5;
			}
			if (get.type2(card) == 'trick' && eff > 0) {
				eff += 2;
			}
			if (get.type2(card) == 'equip' && eff > 0 && player.countCards('he') >= 5) {
				eff += 3;
			}
			return eff;
		},
		content() {
			'step 0';
			player.draw(cards.length);
			('step 1');
			let bool = true;
			for (const i of cards) {
				if (get.type2(i) != get.type2(cards[0])) {
					bool = false;
					break;
				}
			}
			if (bool) {
				switch (get.type2(cards[0])) {
					case 'basic':
						player.recover();
						break;
					case 'trick':
						player.draw(2);
						break;
					case 'equip':
						player.addTempSkill('dz017_shanwu_buff');
						break;
				}
			}
		},
		ai: {
			order: 11,
			result: {
				player: 1,
			},
			threaten: 1.5,
		},
		subSkill: {
			buff: {
				audio: 'ext:夜白神略/audio/character:1',
				audioname: ['ybsl_013yinji', 'dzsl_013yinji', 'dzsl_014xinzhikui', 'ybart_016manchengqi', 'dzsl_016manchengqi', 'ybold_018zhangqing'],
				trigger: {
					source: 'damageBegin1',
				},
				mark: true,
				intro: {
					content: '造成的伤害+1',
				},
				forced: true,
				charlotte: true,
				content() {
					trigger.num++;
				},
			},
		},
	},

	ybsl_hejie: {
		preHidden: true,
		trigger: {
			global: 'damageBefore',
		},
		filter(event, player) {
			return event.target != event.source && !player.hasSkill('ybsl_hejie_mark');
		},
		content() {
			'step 0';
			trigger.cancel();
			('step 1');
			player.addTempSkill('ybsl_hejie_mark');
			trigger.source.draw(1);
			trigger.player.draw(1);
		},
		subSkill: {
			mark: {
				mark: true,
				intro: {
					content: '本回合已发动',
				},
			},
		},
	},

	ybsl_xianyin: {
		audio: 'ext:夜白神略/audio/character:2',
		zhuanhuanji: true,
		mark: true,
		intro: {
			content(storage, player) {
				const str0 = '(括号内的阴阳为鸾鸣的形态)<br/>';
				const str1 = '阴(阴):当你因弃置而失去一张♠️️️牌时,你可令一名角色下个摸牌阶段额外摸一张牌;';
				const str2 = '阴(阳):当你因弃置而失去一张♣️️️牌时,你可令一名角色回复1点体力;';
				const str3 = '阳(阴):当你因弃置而失去一张♥️️️牌时,你可令一名角色失去1点体力;';
				const str4 = '阳(阳):当你因弃置而失去一张♦️️️牌时,你可令一名角色下个摸牌阶段少摸一张牌';
				const str5 = '<span class="bluetext">';
				const str6 = '<span class=yellowtext>';
				const str7 = '<span class=firetext>';
				const str8 = '</span>';
				const str9 = '(若你没有鸾鸣或鸾鸣已使用则改为黑色牌)<br>';
				const str10 = '(若你没有鸾鸣或鸾鸣已使用则改为红色牌)<br>';
				let str;
				if (player.storage.ybsl_xianyin == true) {
					if (player.storage.ybsl_luanming == true) {
						if (player.hasSkill('ybsl_luanming') && !player.getStat('skill').ybsl_luanming) {
							str = str5 + str4 + str8 + str10 + str0;
						} else {
							str = str5 + str4 + str8 + str6 + str10 + str8 + str0;
						}
					} else {
						if (player.hasSkill('ybsl_luanming') && !player.getStat('skill').ybsl_luanming) {
							str = str5 + str3 + str8 + str10 + str0;
						} else {
							str = str5 + str3 + str8 + str6 + str10 + str8 + str0;
						}
					}
				} else {
					if (player.storage.ybsl_luanming == true) {
						if (player.hasSkill('ybsl_luanming') && !player.getStat('skill').ybsl_luanming) {
							str = str5 + str2 + str8 + str9 + str0;
						} else {
							str = str5 + str2 + str8 + str6 + str9 + str8 + str0;
						}
					} else {
						if (player.hasSkill('ybsl_luanming') && !player.getStat('skill').ybsl_luanming) {
							str = str5 + str1 + str8 + str9 + str0;
						} else {
							str = str5 + str1 + str8 + str6 + str9 + str8 + str0;
						}
					}
				}
				return str;
			},
		},

		marktext: '☯',
		trigger: { player: 'loseAfter' },
		filter(event, player) {
			if (event.type != 'discard') {
				return false;
			}
			if (player.hasSkill('ybsl_luanming') && !player.getStat('skill').ybsl_luanming) {
				let suit;
				if (player.storage.ybsl_xianyin == true) {
					if (player.storage.ybsl_luanming == true) {
						suit = 'diamond';
					} else {
						suit = 'heart';
					}
				} else {
					if (player.storage.ybsl_luanming == true) {
						suit = 'club';
					} else {
						suit = 'spade';
					}
				}
				for (const i of event.cards) {
					if (i.suit == suit) {
						return true;
					}
				}
			} else {
				let color;
				if (player.storage.ybsl_xianyin == true) {
					color = 'red';
				} else {
					color = 'black';
				}
				for (const i of event.cards) {
					if (get.color(i) == color) {
						return true;
					}
				}
			}
			return false;
		},
		forced: true,
		content() {
			'step 0';
			if (player.storage.ybsl_xianyin == true) {
				if (player.storage.ybsl_luanming == true) {
					event.tt = -1;
				} else {
					event.tt = -2;
				}
			} else {
				if (player.storage.ybsl_luanming == true) {
					event.tt = 2;
				} else {
					event.tt = 1;
				}
			}
			('step 1');
			let str;
			switch (event.tt) {
				case -2:
					str = '失去1点体力';
					break;
				case -1:
					str = '下个摸牌阶段少摸一张牌';
					break;
				case 1:
					str = '下个摸牌阶段额外摸一张牌';
					break;
				case 2:
					str = '回复1点体力';
					break;
			}
			player
				.chooseTarget()
				.set('prompt2', '请选择一名角色,令其' + str)
				.set('ai', function (target) {
					if (event.tt > 0) {
						return get.attitude(player, target) > 0;
					} else {
						return get.attitude(player, target) <= 0;
					}
				});
			('step 2');
			if (result.targets) {
				const tar = result.targets[0];
				switch (event.tt) {
					case -2:
						tar.loseHp();
						break;
					case -1:
						if (!tar.hasSkill('ybsl_xianyin_draw')) {
							tar.addTempSkill('ybsl_xianyin_draw', { player: 'phaseDrawAfter' });
						}
						if (!tar.storage.ybsl_xianyin_draw) {
							tar.storage.ybsl_xianyin_draw = 0;
						}
						tar.storage.ybsl_xianyin_draw--;
						break;
					case 1:
						if (!tar.hasSkill('ybsl_xianyin_draw')) {
							tar.addTempSkill('ybsl_xianyin_draw', { player: 'phaseDrawAfter' });
						}
						if (!tar.storage.ybsl_xianyin_draw) {
							tar.storage.ybsl_xianyin_draw = 0;
						}
						tar.storage.ybsl_xianyin_draw++;
						break;
					case 2:
						tar.recover();
						break;
				}
				player.changeZhuanhuanji('ybsl_xianyin');
			}
		},
		subSkill: {
			draw: {
				mark: true,
				marktext: '弦',
				intro: {
					content(storage, player) {
						let str = '下个摸牌阶段';
						if (!player.storage.ybsl_xianyin_draw) {
							player.storage.ybsl_xianyin_draw = 0;
						}
						if (player.storage.ybsl_xianyin_draw >= 0) {
							str += '额外摸';
						} else {
							str += '少摸';
						}
						str += Math.abs(player.storage.ybsl_xianyin_draw) + '张牌';
						return str;
					},
				},
				trigger: { player: 'phaseDrawBegin' },
				forced: true,
				content() {
					if (!player.storage.ybsl_xianyin_draw || player.storage.ybsl_xianyin_draw == 0) {
						event.finish();
					} else {
						if (player.storage.ybsl_xianyin_draw > 0) {
							trigger.num += player.storage.ybsl_xianyin_draw;
						} else {
							trigger.num -= Math.abs(player.storage.ybsl_xianyin_draw);
						}
					}
				},
			},
		},
		ai: {
			threaten: 1.1,
			expose: 1,
		},
	},
	ybsl_luanming: {
		viewAs(cards, player) {
			let name = false;
			let nature = null;
			let colorx;
			if (player.storage.ybsl_luanming == true) {
				colorx = 'red';
			} else {
				colorx = 'black';
			}
			for (const i of cards) {
				if (get.color(i) == colorx) {
					let name = i.name;
					let nature = i.nature;
					let card = i;
				}
			}
			if (name) {
				return { name: name, nature: nature, isCard: false, card: card };
			}
			return null;
		},
		lose: true,
		audio: 'ext:夜白神略/audio/character:2',
		zhuanhuanji: true,
		mark: true,
		intro: {
			content(storage, player) {
				if (player.storage.ybsl_luanming == true) {
					return '转换技,每回合限一次,你可以弃置一黑一红共两张牌:阳:视为使用其中的黑色牌并额外执行一次;<span class="bluetext">阴:视为使用其中的红色牌并额外执行一次</span>';
				}
				return '转换技,每回合限一次,你可以弃置一黑一红共两张牌:<span class="bluetext">阳:视为使用其中的黑色牌并额外执行一次;</span>阴:视为使用其中的红色牌并额外执行一次';
			},
		},

		marktext: '☯',
		usable: 1,
		enable: 'chooseToUse',
		position: 'hs',
		filterCard(card, player) {
			if (player.storage.ybsl_luanming == true) {
				const colro = 'red';
			} else {
				const colro = 'black';
			}
			const color = get.color(card);
			if (Array.isArray(ui.selected.cards)) {
				for (const i of ui.selected.cards) {
					if (get.color(i) == color) {
						return false;
					}
				}
			}
			return get.color(card) != 'none';
		},
		selectCard: 2,
		complexCard: true,
		ignoreMod: true,
		precontent() {
			'step 0';
			player.discard(event.result.cards);
			('step 1');
			let color;
			if (player.storage.ybsl_luanming == true) {
				color = 'red';
			} else {
				color = 'black';
			}
			for (const i of event.result.cards) {
				if (get.color(i) == color) {
					event.result.cards = [i];
				}
			}
			('step 2');
			player.changeZhuanhuanji('ybsl_luanming');
		},
		group: 'ybsl_luanming_use',
		subSkill: {
			use: {
				trigger: { player: 'useCard' },
				forced: true,
				charlotte: true,
				filter(event, player) {
					return event.skill == 'ybsl_luanming';
				},
				content() {
					trigger.effectCount++;
				},
			},
		},
	},

	ybsl_zjzilian: {
		forced: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			target: 'useCardToBegin',
		},
		filter(event, player) {
			if (event.card && get.type(event.card) == 'trick') {
				return true;
			}
		},
		content() {
			player.draw();
		},
	},
	ybsl_zjsqiyuan: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',

		content() {
			'step 0';

			player.judge('祈愿', function (card) {
				let i,
					num = 0,
					players = game.filterPlayer();
				for (let i = 0; i < players.length; i++) {
					if (player != players[i]) {
						let att = get.attitude(player, players[i]);
						if (att > 0) {
							num++;
						}
					}
				}
				if (get.color(card) == 'red') {
					if (num > 0) {
						return 2;
					}
					return -2;
				}
				return 2;
			});
			('step 1');
			if (result.color == 'black') {
				player.draw();
				player.storage.counttrigger.ybsl_zjsqiyuan--;

				event.finish();
			} else {
				player
					.chooseTarget(true, function (card, player, target) {
						return target != player;
					})
					.set('prompt', '请选择一名其他角色,令其摸两张牌');
			}
			('step 2');
			if (result.targets[0]) {
				result.targets[0].draw(2);
			}
		},
	},
	ybsl_zjsshixiang: {
		audio: 'ext:夜白神略/audio/character:2',
		limited: true,
		trigger: {
			player: 'phaseBegin',
		},
		check(event, player) {
			if (player.countCards('h') == 3) {
				return true;
			}
			if (player.hp <= 2 && player.countCards('h', 'tao') < 1) {
				return true;
			}
			if (player.countCards('j', 'lebu') > 0) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			player.awakenSkill('ybsl_zjsshixiang');
			event.num = player.countCards('h');
			event.cards = player.getCards('h');
			player.discard(event.cards);
			('step 1');
			player.draw(Math.min(event.num * 3, 9));
			player.skip('phaseDiscard');
		},
	},

	ybsl_beige: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'damageEnd',
		},
		filter(event, player) {
			return event.card && event.card.name == 'sha' && event.source && event.player.classList.contains('dead') == false && player.countCards('he');
		},

		checkx(event, player) {
			const att1 = get.attitude(player, event.player);
			const att2 = get.attitude(player, event.source);
			return att1 > 0 && att2 <= 0;
		},
		preHidden: true,
		cost() {
			const next = player.chooseToDiscard('he', get.prompt2('ybsl_beige', trigger.player));
			const check = lib.skill.ybsl_beige.checkx(trigger, player);
			next.set('ai', function (card) {
				if (_status.event.goon) {
					return 8 - get.value(card);
				}
				return 0;
			});
			next.set('goon', check);
			event.result = next.forResult();
		},
		content() {
			'step 0';
			trigger.player.judge();
			('step 1');
			switch (result.suit) {
				case 'heart':
					trigger.player.recover();
					break;
				case 'diamond':
					trigger.player.draw(2);
					break;
				case 'club':
					trigger.source.chooseToDiscard('he', 2, true);
					break;
				case 'spade':
					trigger.source.turnOver();
					break;
			}
		},
		ai: {
			expose: 0.3,
		},
	},

	ybsl_xuxian: {
		audio: 'ybsl_xuxian1',
		group: ['ybsl_xuxian1', 'ybsl_xuxian2'],
		derivation: ['ybsl_mixianshenshu'],
	},
	ybsl_xuxian1: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		filter(event, player) {
			return player.countCards('hs', { suit: 'diamond' }) > 0;
		},
		position: 'hs',
		filterCard(card, player) {
			return card.suit == 'diamond';
		},
		viewAs: {
			name: 'ybsl_mixianshenshu',
		},
		prompt: '将一张♦️️️牌当弥仙神术使用',
		check(card) {
			return 4.5 - get.value(card);
		},
		ai: {
			order: 2,
			useful: 0,
			value(card, player, index, method) {
				if (player.group != 'shen') {
					return 7;
				} else {
					return 0;
				}
			},
			result: {
				target(player, target) {
					if (target.group != 'shen') {
						return 7;
					} else {
						return 0;
					}
				},
			},
		},
	},
	ybsl_xuxian2: {
		audio: 'ext:夜白神略/audio/character:2',
		popup: 'ybsl_xuxian',
		enable: 'phaseUse',
		filter(event, player) {
			return player.countCards('h', { suit: 'diamond' }) > 0;
		},
		filterCard(card, player) {
			return card.suit == 'diamond';
		},
		check(card) {
			return 5 - get.useful(card);
		},
		content() {
			player.draw();
		},
		discard: false,
		visible: true,
		loseTo: 'discardPile',
		prompt: '献祭一次成仙化凡的机会并换取神明的补偿',
		delay: 0.5,
		prepare(cards, player) {
			player.$throw(cards, 1000);
			game.log(player, '将', cards, '献祭了');
		},
		ai: {
			basic: {
				order: 1.5,
			},
			result: {
				player: 2,
			},
		},
	},

	yb001_fufeng: {
		audio: 'ext:夜白神略/audio/character:1',
		audioname2: {
			ybslshen_014liutianyu: 'yb014_fufeng',
		},
		trigger: {
			player: 'phaseUseBefore',
		},
		filter(event, player) {
			return player.maxHp - player.hp > 0;
		},
		forced: true,
		content() {
			let num = player.maxHp - player.hp;
			if (num > 3) {
				num = 3;
			}
			player.draw(num);
		},
	},
	yb001_wanyue: {
		trigger: {
			player: 'phaseJieshuBegin',
		},
		forced: true,
		mod: {
			aiValue(player, card, num) {
				if (_status.yb001_wanyue) {
					return;
				}
				const evt = get.event();
				if (evt.yb001_wanyue) {
					return num + 3 * evt.yb001_wanyue.includes(card);
				}
				_status.yb001_wanyue = true;
				if (evt.name != 'chooseToDiscard' || evt.parent.name != 'phaseDiscard') {
					return;
				}
				const phase = evt.getParent(2);
				if (phase.name != 'phase' || phase.phaseList[phase.num + 1] != 'phaseJieshu') {
					return;
				}
				const knum = player.countCards() - evt.selectCard[0];
				const hs = {},
					keep = [];
				player.getCards('h', (cardx) => (hs[cardx.suit] ??= []).push(cardx));
				for (const i of Object.values(hs)) {
					i.sort((a, b) => get.value(b) - get.value(a));
				}
				while (keep.length < knum) {
					let suit;
					let value = -Infinity;
					for (const i in hs) {
						if (!hs[i][0]) {
							continue;
						}
						let val = get.value(hs[i][0]);
						if (keep.some((j) => j.suit == i)) {
							val += 3;
						}
						if (val > value) {
							[suit, value] = [i, val];
						}
					}
					keep.push(hs[suit].shift());
				}
				evt.yb001_wanyue = keep;
				delete _status.yb001_wanyue;
				if (keep.includes(card)) {
					return num + 3;
				}
			},
			get aiUseful() {
				return lib.skill.yb001_wanyue.mod.aiValue;
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
		content() {
			'step 0';
			const suits = [];
			const hs = player.getCards('h');
			for (let i = 0; i < hs.length; i++) {
				suits.add(hs[i].suit);
			}
			player.removeAdditionalSkill('yb001_wanyue');
			let num = 4 - suits.length;
			if (num < 1) {
				num = 1;
			}
			player.draw(num);
		},
	},
	yb001_beige: {
		inherit: 'ybsl_beige',
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb001_yishui: {
		trigger: {
			player: 'phaseEnd',
		},
		forced: true,
		audio: 'ext:夜白神略/audio/character:2',
		content() {
			'step 0';
			const discarded = get.discarded();
			if (discarded.length) {
				player.chooseCardButton('选择一张获得之', discarded).set('ai', function (button) {
					return get.value(button.link);
				});
			} else {
				event.finish();
			}
			('step 1');
			if (result.bool && result.links && result.links.length) {
				player.gain(result.links, 'gain2');
			}
			event.finish();
		},
	},

	yb001_yongyue: {
		audio: 'ext:夜白神略/audio/character:2',
		audioname2: {
			ybslshen_014liutianyu: 'yb014_yongyue',
		},
		forced: true,
		trigger: { player: ['phaseJudgeBegin', 'damageBegin3'] },
		filter(event, player, name) {
			return player.getDamagedHp() > 0;
		},
		content() {
			'step 0';
			let num = player.getDamagedHp();

			trigger.cancel();
			player.loseMaxHp(num);
			player.draw(num);
		},
		group: 'yb001_yongyue_lose',
		subSkill: {
			lose: {
				trigger: { player: ['loseAfter'] },
				audio: 'yb001_yongyue',
				audioname2: {
					ybslshen_014liutianyu: 'yb014_yongyue',
				},
				forced: true,
				filter(event, player) {
					if (player.getDamagedHp() < 1) {
						return true;
					}
					return false;
				},
				content() {
					player.gainMaxHp();
				},
			},
		},
	},

	yb001_haowan: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		usable: 1,
		trigger: { player: 'damageBegin3' },
		filter(event, player) {
			if (!event.cards) {
				return false;
			}
			if (!get.itemtype(event.cards) == 'cards') {
				return false;
			}
			if (event.cards.length != 1) {
				return false;
			}
			const suits = [],
				es = player.getCards('e');
			for (const i of es) {
				suits.add(i.suit);
			}
			return suits.includes(event.cards[0].suit);
		},
		content() {
			trigger.cancel();
		},
	},
	yb001_minglun: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: ['phaseBegin', 'phaseAfter'],
		},
		mark: true,
		intro: {
			markcount: 'expansion',
			mark(dialog, content, player) {
				content = player.getExpansions('yb001_minglun');
				if (content && content.length) {
					dialog.addAuto(content);
				}
			},
			content(content, player) {
				content = player.getExpansions('yb001_minglun');
				if (content && content.length) {
					return get.translation(content);
				}
			},
		},
		filter(event, player, name) {
			if (name == 'phaseAfter') {
				let cards = player.getExpansions('yb001_minglun');
				let list = [];
				for (const i of cards) {
					if (list.includes(i.suit)) {
						return true;
					} else {
						list.push(i.suit);
					}
				}
				return player.getExpansions('yb001_minglun') && player.getExpansions('yb001_minglun').length >= 4;
			} else {
				return !player.getExpansions('yb001_minglun') || player.getExpansions('yb001_minglun').length < 4;
			}
		},
		content() {
			'step 0';
			if (event.triggername == 'phaseAfter') {
				player
					.chooseControl(['掉血', '弃掉'])
					.set('prompt', '请选择一项:弃掉所有<命轮>牌,或失去1点体力')
					.set('ai', function (control) {
						let cards = player.getExpansions('yb001_minglun');
						let list = [];
						for (const i of cards) {
							list.push(i.suit);
						}
						if (player.hp <= 2) {
							return '弃掉';
						} else if (list.length < 3) {
							return '掉血';
						}
						return '弃掉';
					});
			} else {
				event.goto(2);
			}
			('step 1');
			if (result.control == '掉血') {
				player.loseHp();
			} else {
				player.discard(player.getExpansions('yb001_minglun'));
			}
			event.finish();
			('step 2');
			let card = get.cards()[0];
			player.showCards(card);
			player.addToExpansion(card, 'gain2').gaintag.add('yb001_minglun');
		},
		derivation: ['yb001_minglun_spade', 'yb001_minglun_heart', 'yb001_minglun_club', 'yb001_minglun_diamond'],
		group: ['yb001_minglun_spade', 'yb001_minglun_heart', 'yb001_minglun_club', 'yb001_minglun_diamond'],
		subSkill: {
			spade: {
				nobracket: true,
				inherit: 'yb018_qiyue',
				audio: 'ext:夜白神略/audio/character:2',
				filter(event, player) {
					let cards = player.getExpansions('yb001_minglun');
					for (const i of cards) {
						if (i.suit == 'spade') {
							return true;
						}
					}
					return false;
				},
			},
			heart: {
				nobracket: true,
				inherit: 'yb014_lvxin',
				audio: 'ext:夜白神略/audio/character:2',
				filter(event, player) {
					if (!lib.skill.yb014_lvxin.filter(event, player)) {
						return false;
					}
					let cards = player.getExpansions('yb001_minglun');
					for (const i of cards) {
						if (i.suit == 'heart') {
							return true;
						}
					}
					return false;
				},
			},
			club: {
				nobracket: true,
				inherit: 'yb018_zheye',
				audio: 'ext:夜白神略/audio/character:2',
				filter(event, player) {
					let cards = player.getExpansions('yb001_minglun');
					for (const i of cards) {
						if (i.suit == 'club') {
							return true;
						}
					}
					return false;
				},
			},
			diamond: {
				nobracket: true,
				inherit: 'yb001_yishui',
				audio: 'ext:夜白神略/audio/character:2',
				filter(event, player) {
					let cards = player.getExpansions('yb001_minglun');
					for (const i of cards) {
						if (i.suit == 'diamond') {
							return true;
						}
					}
					return false;
				},
			},
		},
	},

	yb002_ziren: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,

		ai: {
			order: 11,
			result: {
				player(player, target) {
					return player.hp - 1.1;
				},
			},
		},
		chooseButton: {
			dialog(event, player) {
				return ui.create.dialog('###自刃###' + lib.translate.yb002_ziren_info);
			},
			chooseControl(event, player) {
				let list2 = ['无', '火', '雷', 'cancel2'];
				return list2;
			},
			check() {
				const player = get.player();
				if (get.damageEffect(player, player, player, 'fire') > 0) {
					return '火';
				} else if (get.damageEffect(player, player, player, 'thunder') > 0) {
					return '雷';
				} else if (player.hp > 1) {
					return '无';
				}

				return 'cancel2';
			},
			backup(result, player) {
				return {
					markname: result.control,
					filterCard() {
						return false;
					},
					selectCard: -1,

					content() {
						let name = lib.skill.yb002_ziren_backup.markname;
						if (name == '无') {
							player.damage('nocard', player);
						}
						if (name == '火') {
							player.damage('fire', 'nocard', player);
						}
						if (name == '雷') {
							player.damage('thunder', 'nocard', player);
						}
					},
				};
			},
		},
	},

	yb002_touxin: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		filterTarget(c, p, t) {
			return t != p && t.countGainableCards(p, 'hej') > 0;
		},
		content() {
			'step 0';
			player.loseHp();
			('step 1');
			player.gainPlayerCard(target, true, 'hej', 'visibleMove');
		},
		ai: {
			order: 1,
			result: {
				player(player, target) {
					if (player.hp < 3) {
						return -1.1;
					}
					const hs = target.getGainableCards(player, 'h');
					const es = target.getGainableCards(player, 'e');
					const js = target.getGainableCards(player, 'j');
					const att = get.attitude(player, target);
					if (att < 0) {
						if (
							!hs.length &&
							!es.some((card) => {
								return get.value(card, target) > 0 && card != target.getEquip('jinhe');
							}) &&
							!js.some((card) => {
								const cardj = card.viewAs ? { name: card.viewAs } : card;
								if (cardj.name == 'xumou_jsrg') {
									return true;
								}
								return get.effect(target, cardj, target, player) < 0;
							})
						) {
							return 0;
						}
					} else if (att > 1) {
						return es.some((card) => {
							return get.value(card, target) <= 0;
						}) ||
							js.some((card) => {
								const cardj = card.viewAs ? { name: card.viewAs } : card;
								if (cardj.name == 'xumou_jsrg') {
									return false;
								}
								return get.effect(target, cardj, target, player) < 0;
							})
							? 1.5
							: 0;
					}
					return 1;
				},
				target(player, target) {
					const hs = target.getGainableCards(player, 'h');
					const es = target.getGainableCards(player, 'e');
					const js = target.getGainableCards(player, 'j');
					if (get.attitude(player, target) <= 0) {
						if (hs.length) {
							return -1.5;
						}
						return es.some((card) => {
							return get.value(card, target) > 0 && card != target.getEquip('jinhe');
						}) ||
							js.some((card) => {
								const cardj = card.viewAs ? { name: card.viewAs } : card;
								if (cardj.name == 'xumou_jsrg') {
									return true;
								}
								return get.effect(target, cardj, target, player) < 0;
							})
							? -1.5
							: 1.5;
					}
					return es.some((card) => {
						return get.value(card, target) <= 0;
					}) ||
						js.some((card) => {
							const cardj = card.viewAs ? { name: card.viewAs } : card;
							if (cardj.name == 'xumou_jsrg') {
								return false;
							}
							return get.effect(target, cardj, target, player) < 0;
						})
						? 1.5
						: -1.5;
				},
			},
			threaten: 2,
			expose: 1,
		},
	},
	yb002_zheye: {
		inherit: 'yb018_zheye',
		audio: 'ext:夜白神略/audio/character:2',
	},
	QQQ002_xiangyun: {
		audio: 'yb002_xiangyun',
		trigger: {
			global: ['gameStart'],
		},
		forced: true,
		mark: true,
		intro: {
			content: 'expansion',
		},
		dutySkill: true,
		init: (player) => (player.storage.QQQ002_xiangyun = 1),
		async content(event, trigger, player) {
			let num = Math.floor(game.players.length / 2);
			let cards = get.cards(num);
			player.addToExpansion(cards, 'draw').gaintag.add('QQQ002_xiangyun');
		},
		group: ['QQQ002_xiangyun_1', 'QQQ002_xiangyun_2', 'QQQ002_xiangyun_3', 'QQQ002_xiangyun_4'],
		subSkill: {
			1: {
				audio: 'yb002_xiangyun',
				trigger: {
					global: ['roundStart'],
				},
				forced: true,
				filter: (event, player) => player.countCards('he'),
				async content(event, trigger, player) {
					let prompt = '将至少一张花色各不相同的牌置入<香>,然后摸等量的牌';
					if (player.storage.QQQ002_xiangyun > 1) {
						prompt = '将至少一张牌置入<香>,然后摸双倍的牌';
					}
					const result = await player
						.chooseButton([prompt, player.getCards('he')], [1, player.countCards('he')], true)
						.set('filterButton', (button) => {
							if (ui.selected.buttons.length && player.storage.QQQ002_xiangyun < 2) {
								return !ui.selected.buttons.map((q) => q.link.suit).includes(button.link.suit);
							}
							return true;
						})
						.set('ai', (button) => 10 - get.value(button.link))
						.forResult();
					if (result.links && result.links[0]) {
						player.addToExpansion(result.links, player, 'give').gaintag.add('QQQ002_xiangyun');
						player.draw((player.storage.QQQ002_xiangyun > 1 ? 2 : 1) * result.links.length);
					}
				},
			},
			2: {
				audio: 'yb002_xiangyun',
				trigger: {
					global: ['phaseUseBegin'],
				},
				forced: true,
				filter: (event, player) => (event.player == player || event.player.countCards('h') < event.player.hp) && player.getExpansions('QQQ002_xiangyun').length,
				async content(event, trigger, player) {
					const result = await trigger.player.chooseButton(['获得' + get.translation(player) + '的一张<香>', player.getExpansions('QQQ002_xiangyun')]).forResult();
					if (result.links && result.links[0]) {
						trigger.player.gain(result.links, 'gain2');
					}
				},
			},
			3: {
				audio: 'yb002_xiangyun',
				trigger: {
					player: ['phaseZhunbeiBegin'],
				},
				forced: true,
				filter: (event, player) =>
					(player.storage.QQQ002_xiangyun > 1 &&
						player
							.getExpansions('QQQ002_xiangyun')
							.map((q) => q.suit)
							.unique().length == 4) ||
					(player.storage.QQQ002_xiangyun < 2 &&
						player
							.getExpansions('QQQ002_xiangyun')
							.map((q) => q.suit)
							.unique().length == 3),
				async content(event, trigger, player) {
					player.$skill('使命成功');
					player.awakenSkill('QQQ002_xiangyun');
					player.when({ global: 'roundStart' }).then(() => {
						player.restoreSkill('QQQ002_xiangyun');
						player.storage.QQQ002_xiangyun++;
					});
					player.gain(player.getExpansions('QQQ002_xiangyun'), 'gain2');
					player.recover();
				},
			},
			4: {
				audio: 'yb002_xiangyun',
				trigger: {
					player: ['phaseZhunbeiBegin'],
				},
				forced: true,
				filter: (event, player) => !player.getExpansions('QQQ002_xiangyun').length,
				async content(event, trigger, player) {
					player.$skill('使命失败');
					player.awakenSkill('QQQ002_xiangyun');
					player.when({ global: 'roundStart' }).then(() => {
						player.restoreSkill('QQQ002_xiangyun');
					});
					player.loseHp();
					player.recast(player.getCards('h'));
				},
			},
		},
	},

	yb002_xiangyun: {
		audio: 'ext:夜白神略/audio/character:2',
		group: ['yb002_xiangyun_1', 'yb002_xiangyun_2'],
		subSkill: {
			1: {
				audio: 'yb002_xiangyun',
			},
			2: {
				audio: 'yb002_xiangyun',
			},
		},
	},
	yb002_yishui: {
		inherit: 'yb001_yishui',
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb002_yiqu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',

		filter(event, player) {
			if (player.hasSkill('yb002_shangyuan') && player.countMark('yb002_shangyuan') > game.countPlayer() * 2 - 1) {
				return false;
			}

			return !player.hasSkill('yb002_yiqu_block');
		},
		content() {
			'step 0';
			const controls = [];
			if (ui.cardPile.hasChildNodes()) {
				controls.push('选择牌堆中的一张牌');
			}
			if (ui.discardPile.hasChildNodes()) {
				controls.push('选择弃牌堆中的一张牌');
			}
			if (
				game.hasPlayer(function (current) {
					return current.countCards('hej') > 0;
				})
			) {
				controls.push('选择一名角色区域内的一张牌');
			}
			if (!controls.length) {
				event.finish();
				return;
			}
			event.controls = controls;
			const next = player.chooseControl();
			next.set('choiceList', controls);
			next.set('prompt', '请选择要移动的卡牌的来源');
			next.ai = function () {
				return 0;
			};
			('step 1');
			result.control = event.controls[result.index];
			let list = ['弃牌堆', '牌堆', '角色'];
			for (let i = 0; i < list.length; i++) {
				if (result.control.includes(list[i])) {
					event.index = i;
					break;
				}
			}
			if (event.index == 2) {
				player.chooseTarget('请选择要移动的卡牌的来源', true, function (card, kagari, target) {
					return target.countCards('hej') > 0;
				});
			} else {
				const source = ui[event.index == 0 ? 'discardPile' : 'cardPile'].childNodes;
				let list = [];
				for (let i = 0; i < source.length; i++) {
					list.push(source[i]);
				}
				player.chooseButton(['请选择要移动的卡牌', list], true).ai = get.buttonValue;
			}
			('step 2');
			if (event.index == 2) {
				player.line(result.targets[0]);
				event.target1 = result.targets[0];
				player.choosePlayerCard(result.targets[0], true, 'hej').set('visible', true);
			} else {
				event.card = result.links[0];
			}
			('step 3');
			if (event.index == 2) {
				event.card = result.cards[0];
			}
			const controls1 = ['将这张牌移动到牌堆的顶部或者底部', '将这张牌移动到弃牌堆的顶部或者底部', '将这张牌移动到一名角色对应的区域里'];
			event.controls = controls1;
			const next1 = player.chooseControl();
			next1.set('prompt', '要对' + get.translation(event.card) + '做什么呢？');
			next1.set('choiceList', controls1);
			next1.ai = function () {
				return 2;
			};
			('step 4');
			result.control = event.controls[result.index];
			let list1 = ['弃牌堆', '牌堆', '角色'];
			for (let i = 0; i < list1.length; i++) {
				if (result.control.includes(list1[i])) {
					event.index2 = i;
					break;
				}
			}
			if (event.index2 == 2) {
				player.chooseTarget('要将' + get.translation(card) + '移动到哪一名角色的对应区域呢', true).ai = function (target) {
					return target == _status.event.player ? 1 : 0;
				};
			} else {
				player.chooseControl('顶部', '底部').set('prompt', '把' + get.translation(card) + '移动到' + (event.index2 == 0 ? '弃' : '') + '牌堆的...');
			}
			('step 5');
			if (event.index2 != 2) {
				event.way = result.control;
			} else {
				event.target2 = result.targets[0];
				let list2 = ['手牌区'];
				if (lib.card[card.name].type == 'equip' && event.target2.isEmpty(lib.card[card.name].subtype)) {
					list2.push('装备区');
				}
				if (lib.card[card.name].type == 'delay' && !event.target2.storage._disableJudge && !event.target2.hasJudge(card.name)) {
					list2.push('判定区');
				}
				if (list2.length == 1) {
					event._result = { control: list2[0] };
				} else {
					player.chooseControl(list2).set('prompt', '把' + get.translation(card) + '移动到' + get.translation(event.target2) + '的...').ai = function () {
						return 0;
					};
				}
			}
			('step 6');
			if (event.index2 != 2) {
				const node = ui[event.index == 0 ? 'discardPile' : 'cardPile'];
				if (event.target1) {
					const next = event.target1.lose(card, event.position);
					if (event.way == '顶部') {
						next.insert_card = true;
					}
				} else {
					if (event.way == '底部') {
						node.appendChild(card);
					} else {
						node.insertBefore(card, node.firstChild);
					}
				}
				player.addTempSkill('yb002_yiqu_block');
				game.updateRoundNumber();

				event.finish();
			} else {
				if (result.control == '手牌区') {
					const next = event.target2.gain(card);
					if (event.target1) {
						next.source = event.target1;
						next.animate = 'giveAuto';
					} else {
						next.animate = 'draw';
					}
				} else if (result.control == '装备区') {
					if (event.target1) {
						event.target1.$give(card, event.target2);
					}
					event.target2.equip(card);
				} else {
					if (event.target1) {
						event.target1.$give(card, event.target2);
					}
					event.target2.addJudge(card);
				}
			}
			('step 7');
			player.addTempSkill('yb002_yiqu_block');
			game.updateRoundNumber();
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
		subSkill: {
			block: {
				forced: true,
				charlotte: true,
			},
		},
	},
	ybold_shangyuan: {
		enable: 'phaseUse',
		filter(event, player) {
			if (player.hasSkill('yb002_yiqu_block') && player.countMark('ybold_shangyuan') < player.maxHp - player.hp) {
				return true;
			}
		},
		content() {
			player.removeSkill('yb002_yiqu_block');
			player.addMark('ybold_shangyuan');
		},
		mark: true,
		marktext: '怨',
		intro: {
			content(storage, player) {
				let str = '本回合已使用';
				let max = player.maxHp - player.hp;
				if (max < 0) {
					max = 0;
				}
				str += get.translation(player.storage.ybold_shangyuan);
				str += '/';
				str += get.translation(max);
				str += '次';
				return str;
			},
		},
		ai: {
			combo: 'yb002_yiqu',
		},
	},
	yb002_shangyuan: {
		audio: 'ybold_shangyuan',
		trigger: {
			player: 'damageEnd',
		},

		cost() {
			event.result = player
				.chooseTarget('请选择一个目标')
				.set('ai', function (target) {
					return target.getDamagedHp();
				})
				.forResult();
		},
		content() {
			'step 0';
			event.tar = event.targets[0];
			event.num = event.tar.maxHp - event.tar.hp;
			if (event.num > 5) {
				event.num = 5;
			}
			if (event.num < 1) {
				event.num = 1;
			}
			player
				.chooseControl('摸牌', '弃牌')
				.set('prompt', '令' + get.translation(event.tar) + '摸或弃' + event.num + '张牌?')
				.set('ai', function () {
					const player = get.player();
					return get.attitude(player, event.tar) > 0 ? '摸牌' : '弃牌';
				});
			('step 1');
			if (result.control == '摸牌') {
				event.tar.draw(event.num);
				event.xuan = '摸';
			} else {
				event.tar.chooseToDiscard(event.num, 'he', true);
				event.xuan = '弃';
			}
			game.log(player, '令', event.tar, event.xuan, '了', get.cnNumber(event.num), '张牌');
			player.addMark('yb002_shangyuan', event.num);
		},
		mark: true,
		marktext: '殇',
		intro: {
			content: 'mark',
		},
		ai: {
			maixie: true,
			threaten: 0.6,
			expose: 1,
		},
		group: ['yb002_shangyuan_buff'],
		subSkill: {
			buff: {
				trigger: {
					player: 'phaseEnd',
				},
				forced: true,
				content() {
					player.removeMark('yb002_shangyuan', player.storage.yb002_shangyuan);
				},
			},
		},
	},

	yb003_wucai: {
		inherit: 'yb009_wucai',
		audio: 'ext:夜白神略/audio/character:1',
	},
	yb003_toushi: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb003_fenxiang: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb003_yeyan: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: 'phaseBefore',
			player: 'enterGame',
		},
		filter(event, player) {
			return (event.name != 'phase' || game.phaseNumber == 0) && !lib.inpile.includes('ybsl_lumingqianzhuan');
		},
		content() {
			const listup = ['ybsl_minimahua', 'ybsl_yumiruantang', 'ybsl_weihuabinggan', 'ybsl_qiaokelibang'];
			let list = [];
			let numb = Math.ceil(ui.cardPile.childElementCount / 54) + 1;
			for (let i = 0; i < numb; i++) {
				for (let k of listup) {
					list.push(k);
				}
			}
			list.sort(() => Math.random() - 0.5);
			const numc = numb * 4;
			const suits = ['spade', 'heart', 'club', 'diamond'];
			const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
			suits.sort(() => Math.random() - 0.5);
			numbers.sort(() => Math.random() - 0.5);
			for (let k = 0; k < numc; k++) {
				let card = game.createCard2(list[k % list.length], suits[k % 4], numbers[k % 13]);
				ui.cardPile.insertBefore(card, ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length)]);
			}
			game.broadcastAll(function () {
				lib.inpile.add('ybsl_minimahua');
				lib.inpile.add('ybsl_yumiruantang');
				lib.inpile.add('ybsl_weihuabinggan');
				lib.inpile.add('ybsl_qiaokelibang');
			});
			game.updateRoundNumber();
		},
	},
	yb003_xiangyan: {
		audio: 'ext:夜白神略/audio/character:2',
		global: 'yb003_xiangyan_global',
		forced: true,
		subSkill: {
			global: {
				audio: 'yb003_xiangyan',
				trigger: {
					player: 'useCard2',
				},
				filter(event, player) {
					return get.type2(event.card) == 'ybsl_lingshi' && game.filterPlayer((c) => c.hasSkillTag('YB_fenxiang'));
				},
				async cost(event, trigger, player) {
					event.result = await player
						.chooseTarget('请选择' + get.translation(trigger.card) + '的额外目标')
						.set('selectTarget', function () {
							return [1, game.countPlayer((c) => c.hasSkillTag('YB_fenxiang'))];
						})
						.set('filterTarget', function (card, player, target) {
							const trigger = _status.event.getTrigger();
							const targets = ui.selected.targets;
							if (player.hasSkillTag('YB_fenxiang')) {
								if (targets) {
									for (const i of targets) {
										if (!i.hasSkillTag('YB_fenxiang')) {
											return !trigger.targets.includes(target) && target.hasSkillTag('YB_fenxiang');
										}
									}
									return !trigger.targets.includes(target);
								} else {
									return !trigger.targets.includes(target);
								}
							} else {
								return !trigger.targets.includes(target) && target.hasSkillTag('YB_fenxiang');
							}
						})
						.set('multitarget', function () {
							return true;
						})
						.set('ai', function (target) {
							const player = get.player();
							return get.attitude(player, target) > 5;
						})
						.forResult();
				},
				content() {
					const targets = event.targets;
					game.log(player, '令', targets, '也成为了', trigger.card, '的目标');
					for (const i of targets) {
						trigger.targets.add(i);
					}
				},
			},
		},
		ai: {
			YB_fenxiang: true,
		},
	},

	yb004_wunv: {
		audio: 'ext:夜白神略/audio/character:2',

		audioname2: {
			ybsl_048wushuang: 'yb048_wuling',
		},
		trigger: { player: 'useCard', source: 'damageBegin1' },
		forced: true,
		filter(event, player) {
			if (event.name == 'useCard') {
				return get.type(event.card) == 'trick';
			}
			return player != event.player && player.countCards('h') >= event.player.countCards('h');
		},
		content() {
			if (event.triggername == 'useCard') {
				trigger.nowuxie = true;
			} else {
				trigger.num++;
			}
		},
	},
	yb004_tianqi: {
		audio: 'ext:夜白神略/audio/character:2',
		locked(skill, player) {
			if (!player || !player.storage.yb004_shangyuan) {
				return true;
			}
			return false;
		},
		trigger: {
			player: ['phaseZhunbeiBegin', 'phaseJieshuBegin', 'damageEnd'],
			source: 'damageAfter',
		},
		levelUpFilter(player) {
			if (!player.storage.yb004_shangyuan) {
				return true;
			}
			return false;
		},
		levelUp(player) {
			player.storage.yb004_shangyuan = true;
		},

		filter(event, player, name) {
			if (name == 'damageAfter') {
				if (event.player == player) {
					return false;
				}
			}
			if (!player.storage.yb004_shangyuan) {
				return event.name == 'damage' && event.num > 0;
			}
			return name != 'damageAfter';
		},
		cost() {
			let str = '';
			if (event.triggername == 'phaseZhunbeiBegin') {
				str += "<span style='color: #e1ff00'>准备阶段</span>或结束阶段或当你受到伤害后";
			}
			if (event.triggername == 'phaseJieshuBegin') {
				str += "准备阶段或<span style='color: #e1ff00'>结束阶段</span>或当你受到伤害后";
			}
			if (event.triggername == 'damageEnd') {
				str += "准备阶段或结束阶段或<span style='color: #e1ff00'>当你受到伤害后</span>";
			}
			str += ',你可以进行一次判定,若结果为红色,则你回复1点体力或摸两张牌';
			if (player.storage.yb004_shangyuan) {
				event.result = player.chooseBool(get.prompt('yb004_tianqi', trigger.player), str).forResult();
			} else {
				event.result = { bool: true };
			}
		},
		content() {
			'step 0';

			player.judge('天祈', function (card) {
				if (player.storage.yb004_shangyuan) {
					if (get.color(card) == 'red') {
						return 2;
					}
					return 0;
				} else {
					if (event.triggername == 'damageAfter') {
						if (trigger.num <= 1) {
							if (get.color(card) == 'red') {
								return 1.8;
							}
							return 0;
						} else {
							if (get.color(card) == 'black') {
								return -2;
							}
							return 0;
						}
					} else {
						if (get.color(card) == 'black') {
							return 3;
						}
						return 2.5;
					}
				}
			});

			('step 1');
			switch (result.judge) {
				case 3:
					player.draw(trigger.num + 1);
					break;
				case 2.5:
					player.recover(Math.max(trigger.num - 1, 0));
					break;
				case 2:
					player.chooseDrawRecover(2, true);
					break;
				case 1.8:
					player.chooseDrawRecover(1, true);
					break;
				case -2:
					player.loseHp();
					player.draw();
					break;
				case 0:
					event.finish();
					break;
			}
		},
	},
	yb004_shangyuan: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			source: ['die'],
		},
		filter(event, player) {
			return event.getParent(2).num > 1;
		},
		forced: true,
		juexingji: true,
		derivation: ['yb004_tianqi_rewrite', 'yb004_yujie'],

		content() {
			'step 0';
			player.awakenSkill('yb004_shangyuan');
			player.removeSkill('yb004_wunv');
			player.storage.yb004_shangyuan = true;

			player.chooseDrawRecover(2, true);
			player.addSkill('yb004_yujie');
		},
	},
	yb004_yujie: {
		audio: 'ext:夜白神略/audio/character:1',
		audioname2: {
			ybsl_005wangruobing: 'yb005_yujie',
		},
		forced: true,
		trigger: { player: ['judgeBefore'] },
		content() {
			'step 0';
			trigger.noJudgeTrigger = true;
			('step 1');
			let card = get.cards()[0];
			game.cardsGotoOrdering(card);
			event.card = card;
			game.broadcast(function (card) {
				ui.arena.classList.add('thrownhighlight');
				card.copy('thrown', 'center', 'thrownhighlight', ui.arena).addTempClass('start');
			}, event.card);
			event.node = event.card.copy('thrown', 'center', 'thrownhighlight', ui.arena).addTempClass('start');
			ui.arena.classList.add('thrownhighlight');
			game.addVideo('thrownhighlight1');
			game.addVideo('centernode', null, get.cardInfo(event.card));
			player.chooseBool('是否弃置' + get.translation(event.card) + '？');
			('step 2');
			if (!result.bool) {
				game.log(player, '观看并放回了', event.card);
				ui.cardPile.insertBefore(event.card, ui.cardPile.firstChild);
			} else {
				game.log(player, '展示并弃掉了', event.card);
				event.card.discard();
			}
			game.addVideo('deletenode', player, [get.cardInfo(event.node)]);
			event.node.delete();
			game.broadcast(function (card) {
				ui.arena.classList.remove('thrownhighlight');
				if (card.clone) {
					card.clone.delete();
				}
			}, event.card);
		},
	},

	yb005_bingqing: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			target: 'useCardToBegin',
		},
		filter(event, player) {
			return event.card && event.card.name == 'sha' && (event.card.nature == 'ice' || event.card.nature == 'YB_snow' || event.player.getEquip('hanbing') || event.player.getEquip('ybsl_piaoxueruyi'));
		},
		content() {
			trigger.cancel();
		},
		mod: {
			cardnature(card, player) {
				if (card.name == 'sha') {
					return 'ice';
				}
			},
		},
		ai: {
			threaten: 3,
			effect: {
				target(card, player, target) {
					if (card.name == 'sha' && (get.nature(card) == 'ice' || get.nature(card) == 'YB_snow' || player.getEquip('hanbing') || player.getEquip('ybsl_piaoxueruyi'))) {
						return 'zerotarget';
					}
				},
			},
		},
	},
	yb005_ruyu: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb005_qianxun: {
		mod: {
			targetEnabled(card, player, target, now) {
				if (card.name == 'shunshou' || card.name == 'lebu') {
					return false;
				}
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb005_jieshen: {
		audio: 'ext:夜白神略/audio/character:2',

		trigger: { player: 'phaseZhunbeiBegin' },
		check(event, player) {
			if (player.maxHp > 3) {
				return true;
			}
			if (player.maxHp <= 2) {
				return false;
			}
			if (player.getDamagedHp() > 1) {
				return true;
			}
		},
		derivation: ['yb009_wucai', 'yb018_zheye', 'yb004_yujie'],
		content() {
			'step 0';

			player.loseMaxHp();
			let list = [];
			if (!player.hasSkill('yb009_wucai')) {
				list.push('yb009_wucai');
			}
			if (!player.hasSkill('yb018_zheye')) {
				list.push('yb018_zheye');
			}
			if (!player.hasSkill('yb004_yujie')) {
				list.push('yb004_yujie');
			}
			if (list.length) {
				player.chooseControl(list);
			}
			('step 1');
			if (result.control) {
				player.addSkill(result.control);
			}
			player.draw(3);
		},
	},
	yb005_wucai: {
		inherit: 'yb009_wucai',
		audio: 'ext:夜白神略/audio/character:1',
	},
	yb005_zheye: {
		inherit: 'yb018_zheye',
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb005_yujie: {
		inherit: 'yb004_yujie',
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb006_boxue: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: ['useCard'],
			target: ['useCardToTargeted'],
		},
		init(player) {
			player.storage.yb006_boxue = [];
		},
		levelUpFilter(player) {
			if (!player.storage.yb006_boxuex) {
				return true;
			}
			return false;
		},
		levelUp(player) {
			player.storage.yb006_boxuex = true;
		},
		filter(event, player) {
			if (get.type(event.card) == 'equip') {
				return false;
			}
			if (!player.storage.yb006_boxue.includes(event.card.name)) {
				return true;
			}
			return player.storage.yb006_boxuex;
		},
		content() {
			'step 0';
			if (!player.storage.yb006_boxue.includes(trigger.card.name)) {
				player.storage.yb006_boxue.push(trigger.card.name);
				game.log(player, '记录了', get.translation(trigger.card.name));
			} else {
				player.storage.yb006_boxue.remove(trigger.card.name);
				game.log(player, '移除了', get.translation(trigger.card.name));
				let num = !trigger.targets || !trigger.targets.includes(trigger.player) ? 2 : 1;
				player.draw(num);
			}
		},
		mark: true,
		intro: {
			content(event, player, storage, name, skill) {
				let str = '已记录了';
				str += get.translation(player.storage.yb006_boxue);
				return str;
			},
		},
	},
	yb006_jufan: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		juexingji: true,
		trigger: {
			player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
		},
		derivation: ['yb006_boxue_rewrite', 'yb006_biaoshuai_rewrite'],

		filter(event, player) {
			if (player.storage.yb006_boxue.length >= 3) {
				return true;
			}
			return false;
		},
		init(player) {
			player.storage.yb006_boxue = [];
		},
		content() {
			'step 0';
			player.awakenSkill('yb006_jufan');

			player.storage.yb006_boxuex = true;
			player.storage.yb006_biaoshuaix = true;
			game.log(player, '的【博学】和【表率】改变了');
		},
		ai: {
			combo: 'yb006_boxue',
		},
	},
	yb006_biaoshuai: {
		audio: 'ext:夜白神略/audio/character:2',
		zhuSkill: true,

		trigger: {
			player: 'useCard',
		},
		usable: 1,
		forced: true,
		filter(event, player) {
			if (_status.currentPhase != player) {
				return false;
			}
			return true;
		},
		content() {
			player.storage.yb006_biaoshuai = trigger.card.name;
			player.markSkill('yb006_biaoshuai');
		},
		intro: {
			content(event, player, storage, name, skill) {
				return '本回合第一次用的牌是' + get.translation(player.storage.yb006_biaoshuai) + '';
			},
		},
		levelUpFilter(player) {
			if (!player.storage.yb006_biaoshuaix) {
				return true;
			}
			return false;
		},
		levelUp(player) {
			player.storage.yb006_biaoshuaix = true;
		},
		group: 'yb006_biaoshuai_3',
		subSkill: {
			3: {
				trigger: { global: ['useCard', 'respond'] },
				filter(event, player) {
					if (event.player.group != 'YB_memory') {
						return false;
					}
					if (event.player.hasSkill('yb006_biaoshuai_4')) {
						return false;
					}
					let name = event.card.name;
					return player.hasZhuSkill('yb006_biaoshuai') && event.player != player && name == player.storage.yb006_biaoshuai;
				},

				cost() {
					if (player.storage.yb006_biaoshuaix) {
						let str = '表率:是否摸一张牌,然后你可以令' + get.translation(trigger.player) + '摸一张牌';
						player.chooseBool(str).set('ai', function () {
							return true;
						});
					} else {
						let str = '表率:是否令';
						str += get.translation(player);
						str += '摸一张牌,然后你摸一张牌';
						trigger.player.chooseBool(str).set('ai', function () {
							let att = get.attitude(_status.event.player, player);
							if (att > 0) {
								return true;
							} else {
								return false;
							}
						});
					}
				},
				async content(event, trigger, player) {
					await trigger.player.addTempSkill('yb006_biaoshuai_4', 'roundStart');
					await player.draw();
					const result = { bool: true };
					if (player.storage.yb006_biaoshuaix) {
						const result = await player
							.chooseBool('表率:是否令' + get.translation(trigger.player) + '摸一张牌')
							.set('ai', function () {
								let att = get.attitude(_status.event.player, trigger.player);
								if (att > 0) {
									return true;
								} else {
									return false;
								}
							})
							.forResult();
					}
					if (result.bool) {
						await trigger.player.draw();
					}
				},
			},
			4: { onremove: true },
		},
	},
	yb006_xueyan: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		trigger: {
			global: 'useCardToTargeted',
		},
		filter(event, player) {
			return event.targets.length == 1 && event.target != event.player && event.card.suit;
		},
		cost() {
			const suit = trigger.card.suit;
			event.result = player
				.chooseToDiscard('he')
				.set('filterCard', function (card) {
					return card.suit == suit;
				})
				.set('prompt', get.translation(trigger.player) + '对' + get.translation(trigger.target) + '使用了' + get.translation(trigger.card))
				.set('prompt2', get.prompt('yb006_xueyan') + '<br>弃置一张同花色的牌,令此牌无效？<br>然后此牌原目标摸两张牌')
				.set('ai', function (card) {
					const trigger = _status.event.getTrigger();
					const atk = get.effect(trigger.target, trigger.card, trigger.player, player);
					if (atk > 0) {
						return false;
					}
					let att = get.attitude(_status.event.player, trigger.target);
					if (att > 5) {
						return 6 - get.value(card);
					}
				})
				.forResult();
		},
		logTarget(event, player) {
			return event.target;
		},
		popup: false,
		content() {
			'step 0';
			event.target = trigger.target;

			('step 1');
			game.log(player, '令' + get.translation(trigger.card) + '无效了');
			trigger.targets.length = 0;
			trigger.all_excluded = true;
			('step 2');
			event.target.draw(2);
		},
	},

	yb007_chenwang: {
		audio: 'ext:夜白神略/audio/character:2',

		enable: ['chooseToUse'],
		usable: 1,
		filter(event, player) {
			if (player.countCards('hes') <= 0) {
				return false;
			}
			const history = player.getAllHistory('useCard');
			if (history.length < 1) {
				return false;
			}
			let evt = history[history.length - 1];
			if (get.type(evt.card) == 'equip') {
				return false;
			}
			if (event.filterCard && event.filterCard({ name: evt.card.name }, player, event)) {
				return true;
			}
		},
		filterCard(card, player) {
			return true;
		},
		check(card) {
			return 7 - get.value(card);
		},
		position: 'hes',
		hiddenCard(player, name) {
			const history = player.getAllHistory('useCard');
			if (history.length < 1) {
				return false;
			}
			let evt = history[history.length - 1];

			return name == evt.card.name;
		},
		viewAs(cards, player) {
			const history = player.getAllHistory('useCard');
			if (history.length < 1) {
				return false;
			}
			let evt = history[history.length - 1];
			return { name: evt.card.name };
		},
		getLastUse(player) {
			const history = player.getAllHistory('useCard');
			if (history.length < 1) {
				return false;
			}
			let evt = history[history.length - 1];
			return evt.card.name;
		},
		prompt(event, player) {
			return '是否将一张牌当做' + get.translation(lib.skill.yb007_chenwang.getLastUse(_status.event.player)) + '使用,然后摸一张牌';
		},
		selectCard: 1,
		group: 'yb007_chenwang_2',
		subSkill: {
			2: {
				trigger: { player: 'useCardAfter' },
				audio: 'yb007_chenwang',
				filter(event, player) {
					return event.skill && event.skill == 'yb007_chenwang';
				},

				forced: true,
				content() {
					player.draw();
				},
			},
		},
		ai: {
			order(item, player) {
				player = player || _status.event.player;
				const history = player.getAllHistory('useCard');
				if (!history.length) {
					return false;
				}
				let evt = history.lastItem;
				if (player.isPhaseUsing()) {
					let card = evt.card;
					let num = player.getUseValue({ name: card.name, nature: card.nature });
					if (player.countCards('hs', (cardx) => player.getUseValue(cardx) > num)) {
						return 1;
					}
					return 11;
				}
				return 1;
			},
			result: {
				player(player, target) {
					return 1;
				},
			},
		},
	},

	yb008_wucai: {
		inherit: 'yb009_wucai',
		audio: 'ext:夜白神略/audio/character:1',
	},
	yb008_jianwu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,

		filterCard(card, player) {
			const suit = card.suit;
			if (Array.isArray(ui.selected.cards)) {
				for (const i of ui.selected.cards) {
					if (i.suit == suit) {
						return false;
					}
				}
			}
			return true;
		},
		selectCard: [1, 64],
		complexCard: true,
		filterTarget(card, player, target) {
			return player != target;
		},
		selectTarget() {
			if (ui.selected.targets.length > ui.selected.cards.length) {
				game.uncheck('target');
			}
			return ui.selected.cards.length;
		},
		content() {
			target.damage('nocard');
		},
		check(card) {
			return 5 - get.value(card);
		},
		position: 'he',
		ai: {
			threaten: 1.5,
			damage: true,
			expose: 1,
			order: 8,
			result: {
				player(player, target) {
					return 1;
				},
				target(player, target) {
					return get.damageEffect(target, player);
				},
			},
		},
	},
	yb008_zhenxin: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		content() {
			'step 0';
			event.num = 1;
			('step 1');
			const suits = [];
			const history = game.getGlobalHistory('cardMove', function (evt) {
				if (evt.player == player) {
					if (evt.name == 'lose') {
						for (const i of evt.cards) {
							suits.add(i.suit);
						}
					} else {
						if (evt.name == 'cardsDiscard') {
							for (const i of evt.cards) {
								suits.add(i.suit);
							}
						}
					}
				}
			});
			event.num += suits.length > 2 ? 2 : suits.length;
			('step 2');
			player.draw(event.num);
		},
		ai: {
			threaten: 1.1,
		},
	},
	yb008_wanyue: {
		inherit: 'yb001_wanyue',
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb009_wucai: {
		audio: 'ext:夜白神略/audio/character:1',
		audioname2: {
			ybsl_003yanshuang: 'yb003_wucai',
			ybsl_005wangruobing: 'yb005_wucai',
			ybsl_008wuyuxin: 'yb008_wucai',
			ybsl_010zhouyue: 'yb010_wucai',
		},
		trigger: {
			player: 'phaseDrawBegin2',
		},
		forced: true,
		preHidden: true,
		filter(event, player) {
			return !event.numFixed;
		},
		content() {
			trigger.num++;
		},
		ai: {
			threaten: 1.5,
		},
		group: 'yb009_wucai_luv',
		subSkill: {
			luv: {
				audio: 'yb009_wucai',
				trigger: {
					player: 'damageBegin4',
				},
				audioname2: {
					ybsl_003yanshuang: 'yb003_wucai',
					ybsl_005wangruobing: 'yb005_wucai',
					ybsl_008wuyuxin: 'yb008_wucai',
					ybsl_010zhouyue: 'yb010_wucai',
				},
				forced: true,
				filter(event, player) {
					return player.hp > 1;
				},
				content() {
					trigger.cancel();
					trigger.player.loseHp(trigger.num);
				},
			},
		},
	},
	yb009_tuling: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'loseHpEnd',
		},
		forced: true,
		preHidden: true,
		content() {
			'step 0';
			event.num = trigger.num * 2;
			('step 1');
			player.changeHujia(event.num);
		},
		ai: {
			maihp: true,
		},
		mod: {
			maxHandcard(player, num) {
				return num + player.hujia;
			},
		},
	},
	yb009_tulinghuaqi: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['phaseJudgeBegin', 'phaseDrawBegin', 'phaseUseBegin', 'phaseDiscardBegin'],
		},
		check(event, player) {
			if (player.hp <= 1) {
				return false;
			}
			if (player.hp == 2 && !player.hasSkill('yb009_tuling')) {
				return false;
			}
			return true;
		},
		preHidden: true,
		content() {
			'step 0';
			player.loseHp(1);
			('step 1');
			player.draw(2);
			game.log(player, ':后土所鉴,贞心一片!');
		},
		prompt2(event, player) {
			let str = '现在是';
			if (event.name == 'phaseJudge') {
				str += "<span style='color: #e1ff00'>判定</span>";
			}
			if (event.name == 'phaseDraw') {
				str += "<span style='color: #e1ff00'>摸牌</span>";
			}
			if (event.name == 'phaseUse') {
				str += "<span style='color: #e1ff00'>出牌</span>";
			}
			if (event.name == 'phaseDiscard') {
				str += "<span style='color: #e1ff00'>弃牌</span>";
			}
			str += '阶段开始时,是否失去1点体力并摸两张牌？';
			return str;
		},
		init(player) {
			player.addSkill('yb009_tulinghuaqi_add');
		},
		subSkill: {
			add: {
				audio: 'ext:夜白神略/audio/character:2',
				trigger: {
					source: 'damageBefore',
				},
				filter(event, player) {
					return player.hujia;
				},
				check(event, player) {
					const nm = player.hp + player.hujia;
					if (nm <= 3) {
						return false;
					}
					return true;
				},
				content() {
					'step 0';
					player.changeHujia(-1);
					('step 1');
					trigger.num++;
					game.log(player, ':大地赐予我力量!');
				},
				ai: {
					threaten: 2,
					effect: {
						player(card, player, target) {
							if (card.name == 'tao') {
								return 1.1;
							}
						},
						target(card, player, target) {
							if (get.tag(card, 'damage')) {
								return 1.1;
							}
						},
					},
				},
			},
		},
	},

	yb010_wucai: {
		inherit: 'yb009_wucai',
		audio: 'ext:夜白神略/audio/character:1',
	},
	yb010_yeyu: {
		usable: 1,
		audio: 'ext:夜白神略/audio/character:2',

		trigger: {
			player: 'damageAfter',
			source: 'damageSource',
		},
		filter(event, player) {
			if (event.player == player) {
				let target = event.source;
			} else {
				let target = event.player;
			}
			return event.source && event.player && player != target && target.isAlive() && event.num > 0;
		},
		content() {
			'step 0';
			if (trigger.player == player) {
				event.target = trigger.source;
			} else {
				event.target = trigger.player;
			}
			('step 1');
			player.gainPlayerCard('h', 2, event.target, true);
			('step 2');
			if (event.target.countCards('h') == 0) {
				event.target.draw(2);
			}
		},
		ai: {
			expose: 0.6,
			maixie: true,
			maixie_hp: true,

			result: {
				player(player) {
					return 2;
				},
			},
		},
	},
	yb010_zheye: {
		inherit: 'yb018_zheye',
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb010_mingzhu: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'damageBegin3',
		},
		audioname2: {
			ybsl_068qingyue: 'yb068_mingzhu',
			ybsb_068qingyue: 'yb068_mingzhu',
		},
		forced: true,
		filter(event, player) {
			if (!player.isEmpty(5)) {
				return false;
			}
			if (event.hasNature()) {
				return true;
			}
		},
		content() {
			trigger.cancel();
		},
		ai: {
			nofire: true,
			nothunder: true,
			effect: {
				target(card, player, target, current) {
					if (player == target && get.subtype(card) == 'equip5') {
						if (get.equipValue(card) <= 8) {
							return 0;
						}
					}
					if (!target.isEmpty(5)) {
						return;
					}
					if (get.tag(card, 'natureDamage')) {
						return 'zerotarget';
					}
				},
			},
		},
	},

	yb011_lijian: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return (
				game.countPlayer(function (current) {
					return current != player && current.hasSex('male');
				}) > 1
			);
		},
		check(card) {
			return 10 - get.value(card);
		},
		filterCard: true,
		position: 'he',
		filterTarget(card, player, target) {
			if (player == target) {
				return false;
			}
			if (!target.hasSex('male')) {
				return false;
			}
			if (ui.selected.targets.length == 1) {
				return target.canUse({ name: 'juedou' }, ui.selected.targets[0]);
			}
			return true;
		},
		targetprompt: ['先出杀', '后出杀'],
		selectTarget: 2,
		multitarget: true,
		content() {
			targets[1].useCard({ name: 'juedou' }, 'nowuxie', targets[0], 'noai').animate = false;
		},
		ai: {
			order: 8,
			result: {
				target(player, target) {
					if (ui.selected.targets.length == 0) {
						return -3;
					} else {
						return get.effect(target, { name: 'juedou' }, ui.selected.targets[0], target);
					}
				},
			},
			expose: 0.4,
			threaten: 3,
		},
	},
	yb011_jueleng: {
		preHidden: true,
		mark: true,
		audio: 'yb011_jueleng_1',
		zhuanhuanji: true,
		marktext: '☯',
		intro: {
			content(storage, player, skill) {
				if (player.storage.yb011_jueleng == true) {
					return '当场上角色受到伤害后,若<span class=yellowtext>受伤角色</span>为其他角色,则你可以与受伤角色各摸一张牌或各弃一张牌';
				}
				return '当场上角色受到伤害后,若<span class=firetext>伤害来源</span>为其他角色,则你可以与伤害来源各摸一张牌或各弃一张牌';
			},
		},
		group: ['yb011_jueleng_1', 'yb011_jueleng_3'],
		subSkill: {
			1: {
				audio: 'ext:夜白神略/audio/character:2',
				trigger: {
					global: 'damageEnd',
				},
				prompt2(event, player) {
					let str = '';
					str += '与其各摸一张牌或各弃一张牌？';
					return str;
				},
				filter(event, player) {
					let tar;
					if (!player.storage.yb011_jueleng) {
						tar = event.source;
					} else {
						tar = event.player;
					}
					if (tar) {
						return tar != player && tar.isAlive();
					}
				},
				logTarget(event, player) {
					let tar;
					if (!player.storage.yb011_jueleng) {
						tar = event.source;
					} else {
						tar = event.player;
					}
					if (tar) {
						return tar;
					}
				},
				content() {
					'step 0';
					let tar, str;
					if (!player.storage.yb011_jueleng) {
						tar = trigger.source;
						str = '造成';
					} else {
						tar = trigger.player;
						str = '受到';
					}
					event.tar = tar;
					event.str = str;
					('step 1');
					let list = ['各摸一张牌', '各弃一张牌'];
					player.chooseControl(list).set('prompt', get.translation(event.tar) + event.str + '了伤害,请选择');
					('step 2');
					if (result.control == '各摸一张牌') {
						player.draw();
						event.tar.draw();
					} else {
						player.chooseToDiscard(true, 'he');
						event.tar.chooseToDiscard(true, 'he');
					}
					player.changeZhuanhuanji('yb011_jueleng');
					('step 3');
				},
			},
			3: {
				audio: 'yb011_jueleng_1',
				trigger: {
					player: ['damageBegin3', 'phaseJieshuBegin'],
				},
				content() {
					player.changeZhuanhuanji('yb011_jueleng');
				},
				check(event, player) {
					if (!player.storage.yb011_jueleng) {
						return false;
					}
					return true;
				},
				prompt2: '结束阶段或当你受到伤害时,你可以改变此技能状态',
			},
		},
	},

	yb011_kongbai: {
		audio: 'ext:夜白神略/audio/character:4',
		logAudio(event, player, name) {
			if (name == 'damageBegin4') {
				return ['ext:夜白神略/audio/character/yb011_kongbai3', 'ext:夜白神略/audio/character/yb011_kongbai4'];
			}
			return ['ext:夜白神略/audio/character/yb011_kongbai1', 'ext:夜白神略/audio/character/yb011_kongbai2'];
		},
		trigger: {
			player: ['equipBegin', 'damageBegin4'],
		},
		forced: true,
		filter(event, player, name) {
			if (name == 'damageBegin4') {
				let list = player.storage.yb011_khen || [];
				return event.card && !list.includes(event.card.name);
			}
			return true;
		},
		async content(event, trigger, player) {
			if (event.triggername == 'damageBegin4') {
				let card = trigger.card;
				if (!player.hasSkill('yb011_khen')) {
					player.addSkill('yb011_khen');
				}
				if (!player.storage.yb011_khen) {
					player.storage.yb011_khen = [];
				}
				await player.storage.yb011_khen.push(card.name);
			} else {
				let card = trigger.card;
				let cards = trigger.cards;

				if (!player.hasSkill('yb011_lhen')) {
					player.addSkill('yb011_lhen');
				}
				if (!player.storage.yb011_lhen) {
					player.storage.yb011_lhen = [];
				}
				await player.storage.yb011_lhen.push(card);
				cards.forEach((cardx) => {
					cardx.fix();
					cardx.remove();
					cardx.destroyed = true;
					game.log(cardx, '被销毁了');
				});
				const subtype = lib.card[card.name].subtype;
				await player.disableEquip(subtype);
				const info = lib.card[card.name].skills;
				if (info && info.length) {
					await player.addAdditionalSkill('yb011_lhen', info, true);
				}
				if (Array.isArray(info)) {
					for (const i of info) {
						const infox = lib.skill[i];
						if (!infox.audioname2) {
							infox.audioname2 = {};
						}
						if (!infox.audioname2.sgscq_dianwei) {
							infox.audioname2.sgscq_dianwei = 'sczs_qiangxi_add';
						}
					}
				}
			}
		},
	},
	yb011_khen: {
		audio: 'yb011_kongbai',
		logAudio: () => ['ext:夜白神略/audio/character/yb011_kongbai3', 'ext:夜白神略/audio/character/yb011_kongbai4'],
		charlotte: true,
		mark: true,
		marktext: '痕',
		intro: {
			name: '痕',
			content(storage, player) {
				if (storage && storage.length) {
					let str = get.YB_tobo(storage);
					if (player.hasSkill('yb011_hen')) {
						return '<span style="color: #ff0000;">累了就毁灭吧:<br>' + str + '</span>';
					}
					return '你仿佛伤痕累累:<br>' + str;
				}
				return '你仿佛洁白无瑕';
			},
		},
	},
	yb011_lhen: {
		audio: 'yb011_kongbai',
		logAudio: () => 2,
		charlotte: true,
		mark: true,
		marktext: '迹',
		intro: {
			name: '迹',
			mark(dialog, storage, player) {
				dialog.addText('你人生的白纸上写下了以下篇章');
				let list = [];
				for (let i = 0; i < storage.length; i++) {
					list.add([storage[i].suit, storage[i].number, storage[i].name, get.YB_tag(storage[i])]);
				}
				dialog.addSmall([list, 'vcard']);
			},
		},
	},
	yb011_chenxing: {
		audio: 'ext:夜白神略/audio/character:2',
		dutySkill: true,
		group: ['yb011_chenxing_1', 'yb011_chenxing_2', 'yb011_chenxing_3', 'yb011_chenxing_4'],
		subSkill: {
			1: {},
			2: {},
			3: {
				audio: 'yb002_xiangyun',
				logAudio: () => 1,
				trigger: {
					player: ['phaseZhunbeiBegin'],
				},
				forced: true,
				filter: (event, player) => player.countDisabled() >= 3,
				async content(event, trigger, player) {
					player.$skill('使命成功');
					player.awakenSkill('yb011_chenxing');
					await player.gainMaxHp();
					await player.recover();
					await player.addSkill('yb011_yinmeng');
				},
			},
			4: {
				audio: 'yb002_xiangyun',
				logAudio: () => ['ext:夜白神略/audio/character/yb011_chenxing_2'],
				trigger: {
					player: ['phaseZhunbeiBegin', 'dying'],
				},
				forced: true,
				filter(event, player, name) {
					if (name == 'dying') {
						return true;
					}
					return player.countDisabled() < 3 && player.storage.yb011_khen?.length >= 3;
				},
				async content(event, trigger, player) {
					player.$skill('使命失败');
					player.awakenSkill('yb011_chenxing');
					await player.loseMaxHp();
					player.hp = player.maxHp;
					await player.removeSkill('yb011_kongbai');
					await player.addSkill('yb011_hen');
				},
			},
		},
		derivation: ['yb011_yinmeng', 'yb011_hen'],
	},
	yb011_yinmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			source: 'damageBegin1',
		},
		filter(event, player) {
			if (!event.card) {
				return false;
			}
			return true;
		},
		check(event, player) {
			const storage = player.storage.yb011_khen;
			if (storage.length && storage.includes(event.card.name)) {
				return event.player.hp * 2 - player.countCards('h') > 2;
			}
			return true;
		},
		prompt2(event, player) {
			const storage = player.storage.yb011_khen;
			if (storage.length && storage.includes(event.card.name)) {
				return '当你即将造成卡牌伤害时,<span class=yellowtext>若你有此牌对应的<痕>,你可以防止此伤害并移除对应的<痕>,然后你与当前回合角色各摸一张牌</span>,否则你可以记录对应的<痕>';
			}
			return '当你即将造成卡牌伤害时,若你有此牌对应的<痕>,你可以防止此伤害并移除对应的<痕>,然后你与当前回合角色各摸一张牌,<span class=yellowtext>否则你可以记录对应的<痕></span>';
		},
		content() {
			'step 0';
			const storage = player.storage.yb011_khen;
			if (storage.length && storage.includes(trigger.card.name)) {
				trigger.cancel();
				player.storage.yb011_khen.remove(trigger.card.name);
				player.draw();
				_status.currentPhase.draw();
			} else {
				player.storage.yb011_khen.push(trigger.card.name);
			}
		},
	},
	yb011_hen: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		mod: {
			maxHandcard(player, num) {
				let numb = player.storage.yb011_khen?.length;
				if (numb > 0) {
					return num + numb;
				}
			},
		},
		trigger: {
			player: ['damageBegin3', 'phaseDrawBegin', 'phaseAfter'],
			source: ['damageBegin2'],
		},
		filter(event, player, name) {
			const storage = player.storage.yb011_khen;
			if (name == 'damageBegin2') {
				return event.card && storage.includes(event.card.name);
			} else if (name == 'phaseAfter') {
				return !player.getStat('kill') || player.getStat('kill') == 0;
			} else if (name == 'damageBegin3') {
				return event.card && storage.includes(event.card.name);
			} else {
				return storage.length;
			}
		},
		content() {
			const storage = player.storage.yb011_khen;
			let name = event.triggername;
			if (name == 'damageBegin2') {
				trigger.num++;
			} else if (name == 'phaseAfter') {
				player.loseHp();
			} else if (name == 'damageBegin3') {
				trigger.cancel();
			} else {
				trigger.num += storage.length;
			}
		},
	},

	yb012_bianqian: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		selectCard: 1,
		filterCard: true,
		position: 'h',
		discard: false,
		loseCard: false,
		content() {
			player.addToExpansion(cards, player, 'giveAuto').gaintag.add('yb012_bianqian');
		},
		intro: {
			markcount: 'expansion',
			mark(dialog, content, player) {
				content = player.getExpansions('yb012_bianqian');
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						dialog.addAuto(content);
					} else {
						return '共有' + get.cnNumber(content.length) + '张小抄';
					}
				}
			},
			content(content, player) {
				content = player.getExpansions('yb012_bianqian');
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						return get.translation(content);
					}
					return '共有' + get.cnNumber(content.length) + '张小抄';
				}
			},
		},
		group: ['yb012_bianqian_taoluan', 'yb012_bianqian_longhun'],
		subSkill: {
			taoluan: {
				audio: 'yb012_bianqian',
				enable: 'chooseToUse',
				name: '小抄',
				filter(event, player) {
					let evt = lib.filter.filterCard;
					if (event.filterCard) {
						evt = event.filterCard;
					}
					for (const i of player.getExpansions('yb012_bianqian')) {
						if (evt({ name: i.name }, player, event)) {
							return true;
						}
					}
					return false;
				},
				chooseButton: {
					dialog(event, player) {
						let cards = player.getExpansions('yb012_bianqian');
						return ui.create.dialog('小抄', cards, 'hidden');
					},
					filter(button, player) {
						let card = button.link;
						return _status.event.parent.filterCard({ name: card.name }, player, _status.event.parent);
					},
					check(button) {
						return _status.event.player.getUseValue({ name: button.link.name });
					},
					backup(links, player) {
						const skill = _status.event.buttoned;
						return {
							audio: 'yb012_bianqian',

							viewAs: {
								name: links[0].name,
								nature: links[0].nature,
							},
							filterCard: () => true,
							YBcard: links[0],
							selectCard: [0, 1],
							position: 'h',
							check(event, player, card) {
								let cards = player.getExpansions('yb012_bianqian');
								if (cards.length == 1) {
									return 0;
								} else {
									return 10 - get.value(card);
								}
							},
							card: () => (card ? card : links[0]),
							precontent() {
								if (event.result.cards && event.result.cards[0]) {
									player.discard(lib.skill.yb012_bianqian_taoluan_backup.YBcard);
								} else {
									const cardv = lib.skill.yb012_bianqian_taoluan_backup.YBcard;
									event.result.cards = cardv;
								}
							},
						};
					},
					prompt(links, player) {
						return '小抄:选择 ' + get.translation(links[0]) + '的目标';
					},
				},
				hiddenCard(player, name) {
					return true;
				},
				ai: {
					order(item, player) {
						if (!player) {
							const player = _status.event.player;
						}
						if (player.getExpansions('yb012_bianqian') && player.getExpansions('yb012_bianqian')) {
							return get.order(player.getExpansions('yb012_bianqian')[0]) + 5;
						}
						return 5;
					},
					result: {
						player(player) {
							if (_status.event.dying) {
								return get.attitude(player, _status.event.dying);
							}
							return 1;
						},
					},
				},
			},
			longhun: {
				trigger: { player: 'useCard' },
				forced: true,
				popup: false,
				filter(event, player) {
					let evt = event;

					return evt.skill == 'yb012_bianqian_taoluan_backup' && event.cards[0] == lib.skill.yb012_bianqian_taoluan_backup.YBcard;
				},
				content() {
					player.discard(player.getExpansions('yb012_bianqian'));
				},
			},
		},
	},
	yb012_xibei: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'useCardAfter',
		},
		filter(event, player) {
			if (event.player == player) {
				return false;
			}
			if (event.card.isCard && event.cards.length == 1) {
				return get.position(event.cards[0], true) == 'o';
			}
		},
		check() {
			return true;
		},
		content: async function (event, trigger, player) {
			player.addToExpansion(trigger.cards, player, 'giveAuto').gaintag.add('yb012_bianqian');
		},
		prompt2(event, player) {
			return get.translation(event.player) + '使用了一张' + get.translation(event.card) + ',是否收录为小抄？';
		},
		ai: {
			combo: 'yb012_bianqian',
		},
	},
	yb012_suotu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterTarget(card, player, target) {
			return target != player && target.countCards('h') > 0;
		},
		content() {
			'step 0';
			if (!target.countCards('h') || !player.isIn()) {
				event.finish();
			} else {
				player.choosePlayerCard(target, 'h', true);
			}
			('step 1');
			if (result.bool) {
				event.show_card = result.cards[0];
				let str = get.translation(player);
				player.showCards(event.show_card);
				target
					.chooseControl()
					.set('choiceList', [`令${str}获得${get.translation(event.show_card)}`, `受到${str}造成的1点伤害`])
					.set('ai', function () {
						let evt = _status.event.parent,
							player = evt.target,
							source = evt.player,
							card = evt.show_card;
						if (get.damageEffect(player, source, player) > 0) {
							return 1;
						}
						if (get.attitude(player, source) * get.value(card, source) >= 0) {
							return 0;
						}
						if (card.name == 'tao') {
							return 1;
						}
						return get.value(card, player) > 6 + (Math.max(player.maxHp, 3) - player.hp) * 1.5 ? 1 : 0;
					});
			} else {
				event.finish();
			}
			('step 2');
			if (result.index == 0) {
				target.give(event.show_card, player);
			} else {
				target.damage();
			}
		},
		ai: {
			order: 6,
			tag: {
				damage: 1,
				loseCard: 1,
				gain: 1,
			},
			result: {
				player: 0.1,
				target: -1.2,
			},
		},
	},
	yb012_juli: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb013_shanwu: {
		audio: 'ext:夜白神略/audio/character:1',
	},
	yb013_qingling: {
		audio: 'ext:夜白神略/audio/character:1',
	},
	yb014_lvxin: {
		mod: {
			aiOrder(player, card, num) {
				if (typeof card == 'object' && player == _status.currentPhase) {
					let evt = player.getLastUsed();
					if (evt && evt.card && get.type(evt.card) != 'none' && get.type(card) != 'none' && get.type(evt.card) != get.type(card)) {
						return num + 10;
					}
				}
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCard',
		},
		audioname2: {
			ybsl_033xiaohui: 'yb033_lvxin',
			ybsl_053qiuer: 'yb053_lvxin',
			ybsl_081chenli: 'yb081_lvxin',
		},
		forced: true,
		filter(event, player) {
			let evt = player.getLastUsed(1);
			if (!evt) {
				return false;
			}
			const type1 = get.type(evt.card);
			const type2 = get.type(event.card);
			return type1 && type2 && type1 != 'none' && type2 != 'none' && type1 != type2;
		},
		content() {
			let evt = player.getLastUsed(1);
			if (!evt) {
				return false;
			}

			const type1 = get.type(evt.card);
			const type2 = get.type(trigger.card);
			if (type1 && type2 && type1 != 'none' && type2 != 'none' && type1 != type2) {
				player.draw(num);
			}
		},
		ai: {
			threaten: 2.5,
		},
	},

	yb014_yingbian: {
		preHidden: true,
		groupSkill: true,
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'useCardAfter',
		},
		filter(event, player) {
			return event.card && event.card.isCard && event.skill != 'yb014_yingbian_1' && (player.group == 'YB_memory' || player.group == 'ye');
		},
		content() {
			const type = get.type(trigger.card);
			if (type == 'basic' || type == 'trick') {
				player.storage.suijiyingbian = trigger.card.name;
				player.storage.suijiyingbian_nature = trigger.card.nature;
			}
			player.storage.yb014_yingbian = get.type2(trigger.card);
			player.addTempSkill('yb014_yingbian_1', { player: 'useCardBegin' });
		},
		subSkill: {
			1: {
				mod: {
					cardname(card, player) {
						if (get.type2(card, false) == player.storage.yb014_yingbian && player.storage.suijiyingbian) {
							return player.storage.suijiyingbian;
						}
					},
					cardnature(card, player) {
						if (get.type2(card, false) == player.storage.yb014_yingbian && player.storage.suijiyingbian_nature) {
							return player.storage.suijiyingbian_nature;
						}
					},
				},
			},
		},
	},
	yb014_yazhi: {
		preHidden: true,
		groupSkill: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { source: 'damageBegin1' },
		forced: true,
		filter(event, player) {
			return player.group == 'shen' || player.group == 'ye';
		},
		content() {
			trigger.num++;
		},
		ai: { presha: true },
		group: ['yb014_yazhi_1', 'yb014_yazhi_2'],
		subSkill: {
			1: {
				groupSkill: true,
				audio: 'yb014_yazhi',
				trigger: {
					global: ['dying'],
				},
				charlotte: true,
				forced: true,
				filter(event, player, name) {
					return event.player.hp < 1 && event.reason && event.reason.name == 'damage' && event.source == player && (player.group == 'shen' || player.group == 'ye');
				},
				content() {
					if (player.hp < player.maxHp) {
						player.loseMaxHp();
					} else {
						player.loseHp();
					}
				},
			},
			2: {
				groupSkill: true,
				audio: 'yb014_yazhi',
				trigger: {
					source: ['die'],
				},
				filter(event, player) {
					return player.group == 'shen' || player.group == 'ye';
				},
				charlotte: true,
				forced: true,
				content() {
					player.chooseDrawRecover(2, true);
				},
			},
		},
	},

	yb014_shizhui: {
		audio: 'ext:夜白神略/audio/character:18',

		trigger: {
			global: 'roundStart',
		},
		mark: true,
		forced: true,
		content() {
			const kkk = [];
			if (lib.character[player.name] && lib.character[player.name][3].includes('yb014_shizhui')) {
				kkk.add([player.name]);
			}
			if (lib.character[player.name1] && lib.character[player.name1][3].includes('yb014_shizhui')) {
				kkk.add([player.name1]);
			}
			if (lib.character[player.name2] && lib.character[player.name2][3].includes('yb014_shizhui')) {
				kkk.add([player.name2]);
			}
			if (!kkk.length) {
				kkk.add([player.name]);
			}
			if (!kkk.length) {
				kkk.add([player.name1]);
			}
			('step 0');
			player
				.chooseTarget(lib.filter.notMe)
				.set('prompt', '<span class=yellowtext>游戏开始时或一轮游戏开始时,你可以减1点体力上限,然后将一名其他角色武将牌上的技能加入到你的武将牌上.</span>')
				.set('ai', function (target) {
					const player = _status.event.player;
					if (player.isHealthy()) {
						return 0;
					}
					if (player.hp < 3 && player.getDamagedHp() < 2) {
						return 0;
					}
					let list = [];
					if (lib.character[target.name]) {
						list.addArray(lib.character[target.name][3]);
					}
					if (lib.character[target.name1]) {
						list.addArray(lib.character[target.name1][3]);
					}
					if (lib.character[target.name2]) {
						list.addArray(lib.character[target.name2][3]);
					}
					list = list.filter(function (i) {
						return !player.hasSkill(i);
					});
					if (!list.length) {
						return 0;
					}
					return 1 + Math.random();
				});
			('step 1');
			if (result.bool) {
				let target = result.targets[0];
				player.loseMaxHp();
				let list = [],
					liat = [];
				if (lib.character[target.name]) {
					list.addArray(lib.character[target.name][3]);
					liat.add(target.name);
				}
				if (lib.character[target.name1]) {
					list.addArray(lib.character[target.name1][3]);
					liat.add(target.name1);
				}
				if (lib.character[target.name2]) {
					list.addArray(lib.character[target.name2][3]);
					liat.add(target.name2);
				}
				if (!player.storage.yb014_shizhui_character) {
					player.storage.yb014_shizhui_character = [];
				}
				player.storage.yb014_shizhui_character.addArray(liat);
				for (let j = 0; j < list.length; j++) {
					if (!player.hasSkill(list[j])) {
						player.storage.yb014_shizhui_list.push(list[j]);
						player.addSkill(list[j]);
					}
				}
				game.broadcastAll(function (list) {
					lib.character[kkk[0]][3].addArray(list);
					game.expandSkills(list);
					for (const i of list) {
						const info = lib.skill[i];
						if (!info) {
							continue;
						}
						if (!info.audioname2) {
							info.audioname2 = {};
						}
						if (!info.audioname2[kkk[0]]) {
							info.audioname2[kkk[0]] = 'yb014_shizhui';
						}
					}
				}, list);
			}
		},
		init(player) {
			player.storage.yb014_shizhui_list = [];
			player.storage.yb014_shizhui_delete = true;
			player.storage.yb014_shizhui_character = [];
		},
		group: ['yb014_shizhui_delete', 'yb014_shizhui_ent'],
		subSkill: {
			delete: {
				audio: 'yb014_shizhui',
				enable: 'phaseUse',
				filter(event, player) {
					return true;
				},

				forced: true,

				zhuanhuanSkill: true,
				content() {
					'step 0';
					let list = player.storage.yb014_shizhui_list;
					let num = 8;
					let str = '<span class=yellowtext>出牌阶段,你可以删除一个以此法获得的技能,然后摸三张牌,并</span>';
					if (player.storage.yb014_shizhui_delete == true) {
						str += '<span class=yellowtext>回复1点体力.</span>';
					} else {
						str += '<span class=yellowtext>增加1点体力上限.</span>';
					}
					player.YB_control(list, num, str);
					('step 1');
					if (result.control == 'cancel2') {
						event.finish();
					} else {
						player.removeSkill(result.control);
						player.storage.yb014_shizhui_list.remove(result.control);
						game.log(player, '删除了', result.control);

						player.draw(3);
						event.yy = true;
					}
					('step 2');
					if (event.yy == true) {
						if (player.storage.yb014_shizhui_delete == true) {
							player.storage.yb014_shizhui_delete = false;
							player.recover();
						} else {
							player.storage.yb014_shizhui_delete = true;
							player.gainMaxHp();
						}
					}
				},
			},
			ent: {
				trigger: {
					global: ['phaseBefore', 'gameStart'],
					player: 'gameStart',
				},
				filter(event, player) {
					return event.name != 'phase' || game.phaseNumber == 0;
				},
				forced: true,
				content() {
					player.useSkill('yb014_shizhui');
				},
			},
		},
		intro: {
			name: '诗追',

			mark(dialog, storage, player) {
				if (player.storage.yb014_shizhui_character) {
					let list = player.storage.yb014_shizhui_character;
					dialog.addText('学习过了这些角色');
					dialog.addSmall([list, 'character']);
				}
				let str = '已学习了';
				str += get.translation(player.storage.yb014_shizhui_list);
				if (player.storage.yb014_shizhui_delete == true) {
					str += '<br>本次删除技能回复1点体力';
				} else {
					str += '<br>本次删除技能增加1点体力上限';
				}
				dialog.addText(str);
			},
		},
		ai: {
			threaten: 2.2,
		},
	},

	yb014_xuyuan: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 3,
		chongzhiji: true,
		chongzhiList: ['yihuajiemu', 'ybsl_lumingqianzhuan', 'ybsl_qisihuisheng'],
		init(player, skill) {
			player.storage[skill + '_chongzhijiList'] = lib.skill[skill].chongzhiList;
		},

		mark: true,
		intro: {
			content(storage, player) {
				storage = get.YB_chongzhiList(player, 'yb014_xuyuan');
				if (!storage) {
					return '无';
				}
				let list1 = player.storage['yb014_xuyuan_chongzhijiList'];

				let str = '<br>';
				for (let i = 0; i < list1.length; i++) {
					if (storage.includes(list1[i])) {
						str += '<span class=yellowtext>' + get.translation(list1[i]) + '</span><br>';
					} else {
						str += '<span style="opacity:0.5;">' + get.translation(list1[i]) + '</span><br>';
					}
				}
				for (let i = 0; i < storage.length; i++) {
					if (!list1.includes(storage[i])) {
						str += '<span class=thundertext>' + get.translation(storage[i]) + '</span><br>';
					}
				}
				return '当前列表如下:' + str;
			},
		},
		enable: 'chooseToUse',
		filter(event, player) {
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			let list = get.YB_chongzhiList(player, 'yb014_xuyuan');
			for (let i = 0; i < list.length; i++) {
				if (evt({ name: list[i] }, player, event)) {
					return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];
				let list2 = get.YB_chongzhiList(player, 'yb014_xuyuan');
				for (let i = 0; i < list2.length; i++) {
					list.push(["<span style='color: #e328b7'>许愿</span>", '', list2[i]]);
				}
				return ui.create.dialog("<span style='color: #e328b7'>许愿</span>", [list, 'vcard']);
			},
			filter(button, player) {
				return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
			},
			check(button) {
				if (_status.event.parent.type != 'phase') {
					return 1;
				}
				const player = _status.event.player;
				return player.getUseValue({
					name: button.link[2],
					nature: button.link[3],
				});
			},
			backup(links, player) {
				return {
					filterCard(card, player) {
						const suit = card.suit;
						return true;
					},
					selectCard: [1, 2],
					complexCard: true,
					position: 'hs',
					audio: 'yb014_xuyuan',
					popname: true,
					viewAs: { name: links[0][2] },
					precontent() {
						'step 0';
						('step 1');
						let name = event.result.card.name;
						get.YB_chongzhiList(player, 'yb014_xuyuan').remove(name);
					},
				};
			},
			prompt(links, player) {
				return '将一手牌当作' + get.translation(links[0][2]) + '使用';
			},
		},
		hiddenCard(player, name) {
			let list = get.YB_chongzhiList(player, 'yb014_xuyuan');
			return list.includes(name) && player.countCards('hs') >= 1;
		},
	},
	yb014_jumeng: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseZhunbei',
		},
		filter(event, player) {
			return !event.numFixed;
		},
		forced: true,
		content() {
			player.YB_shelie(3, '聚梦');
		},
		ai: {
			threaten: 1.2,
		},
	},

	yb015_liangquan: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		trigger: {
			global: ['useCardToTargeted'],
		},
		filter(event, player) {
			return event.target != event.player && event.targets.length == 1 && player.canCompare(event.player);
		},
		logTarget: 'player',
		content() {
			'step 0';
			player.chooseToCompare(trigger.player);
			('step 1');
			((event.winer = []), (event.loser = []));
			if (!result.tie) {
				if (result.bool) {
					event.loser.push(trigger.player);
					event.winer.push(player);
				} else {
					event.loser.push(player);
					event.winer.push(trigger.player);
				}
			} else {
				event.loser.push(trigger.player);
				event.loser.push(player);
			}
			('step 2');
			if (event.loser.length) {
				for (const i of event.loser) {
					trigger.parent.targets.push(i);
				}
			}
			('step 3');
			delete result.bool;
			('step 4');
			if (event.winer.length) {
				event.winer[0].chooseBool('是否摸两张牌令' + get.translation(trigger.card) + '无效？');
			} else {
				event.finish();
			}
			('step 5');
			if (result.bool) {
				event.winer[0].draw(2);
				trigger.targets.length = 0;
				trigger.all_excluded = true;
			}
		},
	},
	yb015_bixin: {
		audio: 'ext:夜白神略/audio/character:2',
		audioname2: {
			ybsl_123xuelang: 'yb123_bixin',
		},
		mod: {
			cardnumber(card) {
				if (card.suit == 'heart') {
					return 13;
				}
				if (card.suit == 'spade') {
					return 1;
				}
			},
		},
		forced: true,
		group: 'yb015_bixin_number',
		subSkill: {
			number: {
				audio: 'yb015_bixin',
				trigger: { player: 'compare', target: 'compare' },
				filter(event, player) {
					if (event.player == player) {
						return !event.iwhile && ['heart', 'spade'].includes(event.card1.suit);
					} else {
						return ['heart', 'spade'].includes(event.card2.suit);
					}
				},

				forced: true,
				content() {
					if (player == trigger.player) {
						if (trigger.card1.suit == 'heart') {
							game.log(player, '拼点牌点数视为', '#yK');
							trigger.num1 = 13;
						} else {
							game.log(player, '拼点牌点数视为', '#yA');
							trigger.num1 = 1;
						}
					} else {
						if (trigger.card2.suit == 'heart') {
							game.log(player, '拼点牌点数视为', '#yK');
							trigger.num2 = 13;
						} else {
							game.log(player, '拼点牌点数视为', '#yA');
							trigger.num2 = 1;
						}
					}
				},
			},
		},
	},

	yb016_shenzou: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		content() {
			'step 0';
			player.chooseToPlayBeatmap(lib.skill.yb016_shenzou.beatmaps.randomGet());
			('step 1');
			const score = Math.floor(Math.min(5, result.accuracy / 17));
			event.score = score;
			game.log(player, '的演奏评级为', '#y' + result.rank[0], ',获得积分点数', '#y' + score, '分');
			let list3 = lib.skill.yb016_juli.getInfo(player);
			let num = Math.min(list3[0], list3[1], 2);
			if (score < num) {
				event.finish();
				return;
			}
			('step 2');
			let list = [];
			let list2 = lib.skill.yb016_juli.getInfo(player);
			if (event.score >= list2[0]) {
				list.push('增加最大重铸数[' + list2[0] + ']');
			}
			if (event.score >= list2[1]) {
				list.push('增加技能囊括范围[' + list2[1] + ']');
			}
			if (event.score >= 5 && !player.storage.yb016_juli_add) {
				list.push('将【杀】改为伤害牌');
			}
			if (event.score >= 2) {
				list.push('全部摸牌');
			}
			event.list4 = list;
			if (list.length) {
				let str = '神奏:还剩' + event.score + '分,';
				for (let i = 0; i < list.length; i++) {
					str += list[i];
					if (i < list.length - 1) {
						str += ',还是';
					}
				}
				player.chooseControl(list).set('prompt', str);
			} else {
				event._result = { control: '全部摸牌' };
			}
			('step 3');
			const score1 = event.score;
			const list6 = lib.skill.yb016_juli.getInfo(player);
			if (result.control == '全部摸牌') {
				if (score1 > 1) {
					player.draw(Math.floor(score1 / 2));
				}
				event.finish();
			} else if (result.control == '将【杀】改为伤害牌') {
				player.storage.yb016_juli_add = true;
				event.finish();
			} else {
				if (result.control == '增加最大重铸数[' + list6[0] + ']') {
					event.score -= list6[0];
					player.storage.yb016_juli[0]++;
					if (event.score > 0) {
						event.goto(2);
					} else {
						event.finish();
					}
				} else if (result.control == '增加技能囊括范围[' + list6[1] + ']') {
					event.score -= list6[1];
					player.storage.yb016_juli[1]++;
					if (event.score > 0) {
						event.goto(2);
					} else {
						event.finish();
					}
				}
			}
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
		beatmaps: [
			{
				name: '鳥の詩',

				filename: 'tori_no_uta',

				timeleap: [1047, 3012, 4978, 5469, 5961, 6452, 6698, 7435, 8909, 10875, 12840],

				current: -110,

				judgebar_height: 0.16,

				range1: [84, 110],
				range2: [90, 104],
				range3: [94, 100],

				speed: 25,
			},
			{
				name: '竹取飛翔　～ Lunatic Princess',
				filename: 'taketori_hishou',
				timeleap: [1021, 1490, 1959, 2896, 3834, 4537, 4771, 5709, 6646, 7585, 8039, 8494, 9403, 10291, 11180, 11832, 12049, 12920, 13345, 13771, 14196],
				current: -110,
				judgebar_height: 0.16,
				range1: [84, 110],
				range2: [90, 104],
				range3: [94, 100],
				speed: 25,
				node_color: 'linear-gradient(rgba(250, 170, 190, 1), rgba(240, 160, 180, 1))',
				judgebar_color: 'linear-gradient(rgba(240, 120, 243, 1), rgba(245, 106, 230, 1))',
			},
			{
				name: 'ignotus',
				filename: 'ignotus',

				number_of_tracks: 4,

				mapping: [0, 2, 3, 1, 1, 0, 3, 0, 0, 3, 0, 0, 2, 1, 2],

				timeleap: game.generateBeatmapTimeleap(170, [0, 4, 8, 12, 14, 16, 16.5, 23.5, 24, 31, 32, 40, 45, 46, 47]),
				current: -110,
				judgebar_height: 0.16,
				range1: [84, 110],
				range2: [90, 104],
				range3: [94, 100],
				speed: 25,
				node_color: 'linear-gradient(rgba(240, 250, 240, 1), rgba(230, 240, 230, 1))',
				judgebar_color: 'linear-gradient(rgba(161, 59, 150, 1), rgba(58, 43, 74, 1))',
			},
			{
				name: 'Super Mario 3D World Theme',
				filename: 'sm3dw_overworld',

				mapping: 'random',
				timeleap: [0, 1071, 1518, 2054, 4018, 4286, 5357, 6429, 7500, 8571, 9643, 10714, 11786, 12321, 12589, 12857, 13929, 15000, 16071, 17143, 18214, 18482, 18750, 19018, 19286, 20357],
				current: -110,
				judgebar_height: 0.16,
				range1: [84, 110],
				range2: [90, 104],
				range3: [94, 100],
				speed: 25,
				node_color: 'linear-gradient(rgba(120, 130, 240, 1), rgba(100, 100, 230, 1))',
				judgebar_color: 'linear-gradient(rgba(230, 40, 30, 1), rgba(220, 30, 10, 1))',
			},
			{
				name: '只因你太美',
				filename: 'chicken_you_are_so_beautiful',
				number_of_tracks: 7,
				mapping: [3, 6, 4, 5, 6, 2, 3, 2, 1, 2, 0, 4, 3, 6, 5, 4, 3, 6, 3, 2, 3, 1, 0, 1, 2, 3, 4, 5, 6],
				timeleap: game.generateBeatmapTimeleap(107, [2, 3.5, 4.5, 5.5, 6.5, 8.5, 10, 11.5, 12.5, 13.5, 14.5, 15.5, 18, 19.5, 20.5, 21.5, 22.5, 24.5, 26, 27.5, 28.5, 29.5, 30.5, 31, 31.5, 32, 32.5, 33, 33.5]),

				hitsound: 'chickun.wav',
				current: -110,
				judgebar_height: 0.16,
				range1: [84, 110],
				range2: [90, 104],
				range3: [94, 100],
				speed: 25,
				node_color: 'linear-gradient(#99f, #66c)',
				judgebar_color: 'linear-gradient(#ccf, #99c)',
			},
			{
				name: 'Croatian Rhapsody',
				filename: 'croatian_rhapsody',
				mapping: [4, 1, 2, 1, 0, 0, 4, 5, 1, 3, 2, 1, 0, 0],
				timeleap: game.generateBeatmapTimeleap(96, [4, 6, 8, 9, 10, 11, 12, 13.5, 14, 15.5, 16, 17, 18, 19]),
				current: -110,
				judgebar_height: 0.16,
				range1: [84, 110],
				range2: [90, 104],
				range3: [94, 100],
				speed: 25,
				node_color: 'linear-gradient(#fff, #ccc)',
				judgebar_color: 'linear-gradient(#fff, #ccc)',
			},
			{
				name: '罗刹海市',
				filename: 'rakshasa_sea_city',
				number_of_tracks: 7,
				mapping: 'random',
				timeleap: game.generateBeatmapTimeleap(150, [0, 2, 4, 6, 7, 9, 11, 13, 14, 16, 18, 20, 21, 23, 25, 27]),
				current: -110,
				judgebar_height: 0.16,
				range1: [84, 110],
				range2: [90, 104],
				range3: [94, 100],
				speed: 25,
				node_color: 'linear-gradient(#333, #000)',
				judgebar_color: 'linear-gradient(#c66, #933)',
			},
			{
				name: 'Pigstep (Stereo Mix)',
				filename: 'pigstep',
				number_of_tracks: 16,
				timeleap: game.generateBeatmapTimeleap(170, [3, 4, 6, 6.5, 7.5, 11, 12, 14, 14.5, 15.5, 19, 20, 22, 22.5, 23.5, 27, 28, 30, 30.5, 31.5, 35, 36, 38, 38.5, 39.5, 43, 44, 46, 46.5, 47.5, 51, 52, 54, 54.5, 55.5, 59, 60, 62, 62.5]),
				current: -110,
				judgebar_height: 0.16,
				range1: [84, 110],
				range2: [90, 104],
				range3: [94, 100],
				speed: 25,
				node_color: 'linear-gradient(#066, #033)',
				judgebar_color: 'linear-gradient(#633, #300)',
			},
		],
		derivation: 'yb016_shenzou_faq',
	},
	yb016_juli: {
		audio: 'ext:夜白神略/audio/character:2',
		audioname2: {
			ybsl_012zhengjiayi: 'yb012_juli',
		},
		init(player) {
			if (!player.storage.yb016_juli) {
				player.storage.yb016_juli = [1, 1, 1];
			}
		},
		getInfo(player) {
			if (!player.storage.yb016_juli) {
				player.storage.yb016_juli = [1, 1, 1];
			}
			return player.storage.yb016_juli;
		},
		forced: true,
		trigger: {
			global: 'useCardToTargeted',
		},
		filter(event, player) {
			if (event.player == event.target) {
				return false;
			}
			let list = lib.skill.yb016_juli.getInfo(player);

			if (!event.player.isIn() || get.distance(player, event.target) > list[1]) {
				return false;
			}
			if (player.storage.yb016_juli_add == true) {
				return get.tag(event.card, 'damage');
			} else {
				return event.card && event.card.name == 'sha';
			}
		},
		content() {
			'step 0';
			event.list = lib.skill.yb016_juli.getInfo(player);
			if (trigger.target == player) {
				event._result = { bool: true };
			} else {
				player.chooseBool('是否令' + get.translation(trigger.target) + '选择是否重铸牌,以此令' + get.translation(trigger.card) + '有几率对其无效？').set('ai', function () {
					let att = get.attitude(_status.event.player, trigger.target);
					let bool = _status.event.bool;
					if (att > 0) {
						return bool;
					} else {
						return !bool;
					}
				});
			}
			('step 1');
			if (result.bool) {
				trigger.target
					.chooseCard('he', [1, event.list[0]])
					.set('prompt', get.prompt2('yb016_juli'))
					.set('ai', function (card) {
						return 6 - get.value(card);
					});
			} else {
				event.finish();
			}
			('step 2');
			if (result.cards) {
				event.cards = result.cards;
				trigger.target.recast(event.cards);
			} else {
				event.finish();
			}
			('step 3');
			event.list2 = [];
			for (const i of event.cards) {
				const type = get.type2(i);
				if (!event.list2.includes(type)) {
					event.list2.push(type);
				}
			}
			let eff = get.effect(player, trigger.card, trigger.player, trigger.player);
			const list3 = get.YB_tobo(event.list2);
			trigger.player
				.chooseToDiscard(event.list[2], 'he', function (card) {
					return event.list2.includes(get.type2(card));
				})
				.set('prompt', '请弃置' + event.list[2] + '张牌,且牌的类型必须在【' + list3 + '】之中')
				.set('ai', function (card) {
					if (_status.event.eff > 0) {
						return 10 - get.value(card);
					}
					return 0;
				})
				.set('eff', eff);
			('step 4');
			if (!result.cards) {
				trigger.parent.excluded.add(trigger.target);
			}
		},
	},

	yb016_shanbiao: {
		audio: 'ext:夜白神略/audio/character:2',
		init(player, skill) {
			player.storage.yb016_shanbiao = false;
		},
		zhuanhuanji: true,
		mark: true,
		marktext: '☯',
		intro: {
			content(storage, player, skill) {
				if (!player.storage.yb016_shanbiao) {
					return '锁定技,转换技,回合结束时或当你武将牌翻面时,阳:<span class="bluetext">你摸两张牌</span>;阴,你受到当前回合角色造成的1点伤害.<br><span class="bluetext">你阳状态下,受到的伤害-1</span>;<br>你阴状态下,造成的伤害-1';
				}
				return '锁定技,转换技,回合结束时或当你武将牌翻面时,阳:你摸两张牌;阴,<span class="bluetext">你受到当前回合角色造成的1点伤害</span>.<br>你阳状态下,受到的伤害-1;<br><span class="bluetext">你阴状态下,造成的伤害-1</span>';
			},
		},
		group: ['yb016_shanbiao_damage'],
		subSkill: {
			damage: {
				forced: true,
				trigger: {
					player: 'damageBegin4',
					source: 'damageBegin2',
				},
				filter(event, player, name) {
					if (name == 'damageBegin4') {
						return player.storage.yb016_shanbiao;
					}
					return !player.storage.yb016_shanbiao;
				},
				content() {
					trigger.num--;
				},
			},
			yang: {},
			ying: {},
		},
		forced: true,
		trigger: {
			player: ['phaseEnd', 'turnOverEnd'],
		},
		filter() {
			return true;
		},
		content() {
			if (player.storage.yb016_shanbiao == true) {
				player.draw(2);
				player.changeZhuanhuanji('yb016_shanbiao');
			} else {
				player.damage(_status.currentPhase || 'nosource');
				player.changeZhuanhuanji('yb016_shanbiao');
			}
		},
	},
	yb016_jiushi: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'jiushi',
	},

	yb016_xianyue: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'recoverAfter',
		},
		forced: true,
		preHidden: true,
		check(player, cards) {
			if (player.countCards('he') > 2) {
				return true;
			}
		},
		content() {
			'step 0';
			player.chooseToDiscard('he', get.prompt2('yb016_xianyue', trigger.player)).set('ai', function (card) {
				return 8 - get.value(card);
			});
			('step 1');
			if (result.bool) {
				player.judge();
			} else {
				event.finish();
			}
			('step 2');
			event.suit = result.suit;
			if (event.suit == 'heart') {
				player.recover();
			}
			if (event.suit == 'diamond') {
				player.draw(2);
			}
			if (event.suit == 'spade') {
				player.chooseTarget(get.prompt('yb016_xianyue'), '令一名角色失去1点体力').set('ai', function (target) {
					const player = _status.event.player;
					let att = get.attitude(player, target);
					if (att < 0) {
						att = -Math.sqrt(-att);
					} else {
						att = Math.sqrt(att);
					}
					return att * lib.card.guohe.ai.result.target(player, target);
				});
			}
			if (event.suit == 'club') {
				player
					.chooseTarget('弃置一名角色两张牌', function (card, player, target) {
						return target.countCards('he');
					})
					.set('ai', function (target) {
						const player = _status.event.player;
						let att = get.attitude(player, target);
						if (att < 0) {
							att = -Math.sqrt(-att);
						} else {
							att = Math.sqrt(att);
						}
						return att * lib.card.guohe.ai.result.target(player, target);
					});
			}
			('step 3');
			if (result.bool) {
				let target = result.targets[0];
				player.line(target, 'green');
				if (event.suit == 'spade') {
					target.loseHp();
				}
				if (event.suit == 'club') {
					player.discardPlayerCard(target, 'he', 2, true);
				}
			}
		},
		ai: {
			result: {
				player: 2,
			},
		},
	},
	yb016_tianliao: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'recoverBefore',
		},
		forced: true,
		preHidden: true,
		check(event, player, cards) {
			const ys = player.maxHp - player.hp;
			if (event.num == ys - 1) {
				return false;
			}
			if (player.countCards('he') > 2) {
				return true;
			}
		},
		content() {
			'step 0';
			player.chooseToDiscard('he', get.prompt2('yb016_tianliao', trigger.player)).set('ai', function (card) {
				return 8 - get.value(card);
			});
			('step 1');
			if (result.bool) {
				trigger.num++;
			} else {
				event.finish();
			}
		},
		ai: {
			result: {
				player: 3,
			},
			effect: {
				player(card, player, target) {
					if (card.name == 'tao') {
						return 1.3;
					}
				},
				target(card, player, target) {
					if (get.tag(card, 'damage')) {
						if (player.hasSkillTag('jueqing', false, target)) {
							return [1, -1];
						}
						return 0.7;
					}
				},
			},
		},
	},
	yb016_qingjie: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'damageEnd',
		},
		forced: true,
		content() {
			'step 0';
			event.num = Math.min(trigger.num, 9);
			player.recover(event.num);
			('step 1');
			player.loseHp(event.num);
		},
		ai: {
			maixie: true,
			maixie_hp: true,
		},
	},
	yb016_pojie: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'recoverBegin',
		},
		forced: true,
		filter(event, player) {
			event.ys = player.maxHp - player.hp;
			event.zl = event.num;
			if (event.ys < event.zl) {
				return (event.yc = event.zl - event.ys);
			}
		},
		content() {
			'step 0';
			trigger.num -= trigger.yc;
			('step 1');
			player.gainMaxHp(trigger.yc);
			player.draw(trigger.yc);
		},
	},

	yb017_chuanxin: {
		audio: 'ext:夜白神略/audio/character:1',
		trigger: {
			global: 'phaseJieshuBegin',
		},
		forced: true,
		filter(event, player) {
			return event.player.getHistory('useCard', function (card) {
				return true;
			}).length;
		},
		content() {
			'step 0';
			let list = [];
			let list1 = [];
			trigger.player.getHistory('useCard', function (evt) {
				if (get.type(evt.card) == 'equip' || get.type(evt.card) == 'delay') {
					return;
				}
				let name = evt.card.name;
				let nature = evt.card.nature;
				let name2;
				if (name == 'sha') {
					if (nature) {
						switch (nature) {
							case 'fire':
								name2 = 'huosha';
								break;
							case 'thunder':
								name2 = 'leisha';
								break;
							case 'kami':
								name2 = 'kamisha';
								break;
							case 'ice':
								name2 = 'icesha';
								break;
							case 'stab':
								name2 = 'cisha';
								break;
							default:
								name2 = nature + 'sha';
								break;
						}
					}
				}
				const name3 = name2 || name;
				if (!list1.includes(name3)) {
					list.add(['传信', '', name, nature]);
					list1.add(name3);
				}
			});
			player.chooseButton(
				['传信:选择要使用的牌,或点取消摸一张牌<br>此操作不可逆,如果选择了卡牌但没有选择使用的话,不会回退到这一步,而是直接摸一张牌', [list, 'vcard']],
				function (button) {
					return _status.event.player.getUseValue({ name: button.link[2], nature: button.link[3] });
				},
				function (button) {
					return _status.event.player.hasUseTarget({ name: button.link[2], nature: button.link[3] });
				},
			);

			('step 1');
			if (!result.bool) {
				player.draw();
				event.finish();
			} else {
				event._result = player.chooseUseTarget({ name: result.links[0][2], nature: result.links[0][3] }, false);
			}
			('step 2');
			if (!result.bool) {
				player.draw();
				event.finish();
			}
		},
	},
	yb017_chuanxinx: {
		audio: 'yb017_chuanxin',
		trigger: {
			global: 'phaseJieshuBegin',
		},
		forced: true,
		filter(event, player) {
			return event.player.getHistory('useCard', function (card) {
				return get.color(card.card) != 'none';
			}).length;
		},
		content() {
			'step 0';
			event.color = [];
			trigger.player.getHistory('useCard', function (card) {
				if (get.color(card.card) != 'none') {
					event.color.add(get.color(card.card));
				}
			});
			event.count = 0;
			('step 1');
			event.count++;
			let list = [];
			let list1 = [];
			trigger.player.getHistory('useCard', function (evt) {
				if (get.type(evt.card) == 'equip' || get.type(evt.card) == 'delay') {
					return;
				}
				let name = evt.card.name;
				let nature = evt.card.nature;
				let name2;
				if (name == 'sha') {
					if (nature) {
						switch (nature) {
							case 'fire':
								name2 = 'huosha';
								break;
							case 'thunder':
								name2 = 'leisha';
								break;
							case 'kami':
								name2 = 'kamisha';
								break;
							case 'ice':
								name2 = 'icesha';
								break;
							case 'stab':
								name2 = 'cisha';
								break;
							default:
								name2 = nature + 'sha';
								break;
						}
					}
				}
				const name3 = name2 || name;
				if (!list1.includes(name3)) {
					list.add(['传信', '', name, nature]);
					list1.add(name3);
				}
			});
			player.chooseButton(
				['传信:选择要使用的牌,或点取消摸一张牌' + event.count + '/' + event.color.length + '<br>此操作不可逆,如果选择了卡牌但没有选择使用的话,不会回退到这一步,而是直接摸一张牌', [list, 'vcard']],
				function (button) {
					return _status.event.player.getUseValue({ name: button.link[2], nature: button.link[3] });
				},
				function (button) {
					return _status.event.player.hasUseTarget({ name: button.link[2], nature: button.link[3] });
				},
			);

			('step 2');
			if (!result.bool) {
				player.draw();

				event.goto(4);
			} else {
				event._result = player.chooseUseTarget({ name: result.links[0][2], nature: result.links[0][3] }, false);
			}
			('step 3');
			if (!result.bool) {
				player.draw();
			}
			('step 4');
			if (event.count < event.color.length) {
				event.goto(1);
			}
		},
	},
	yb017_chuanxiny: {
		audio: 'yb017_chuanxin',
		trigger: {
			global: 'phaseJieshuBegin',
		},
		forced: true,
		filter(event, player) {
			return event.player.getHistory('useCard', function (card) {
				return true;
			}).length;
		},
		content() {
			'step 0';
			event.color = [];
			trigger.player.getHistory('useCard', function (card) {
				event.color.add(get.color(card.card));
			});
			event.count = 0;
			('step 1');
			event.count++;
			let list = [];
			let list1 = [];
			trigger.player.getHistory('useCard', function (evt) {
				if (get.type(evt.card) == 'equip' || get.type(evt.card) == 'delay') {
					return;
				}
				let name = evt.card.name;
				let nature = evt.card.nature;
				let name2;
				if (name == 'sha') {
					if (nature) {
						switch (nature) {
							case 'fire':
								name2 = 'huosha';
								break;
							case 'thunder':
								name2 = 'leisha';
								break;
							case 'kami':
								name2 = 'kamisha';
								break;
							case 'ice':
								name2 = 'icesha';
								break;
							case 'stab':
								name2 = 'cisha';
								break;
							default:
								name2 = nature + 'sha';
								break;
						}
					}
				}
				const name3 = name2 || name;
				if (!list1.includes(name3)) {
					list.add(['传信', '', name, nature]);
					list1.add(name3);
				}
			});
			player.chooseButton(
				['传信:选择要使用的牌,或点取消摸一张牌' + event.count + '/' + event.color.length + '<br>此操作不可逆,如果选择了卡牌但没有选择使用的话,不会回退到这一步,而是直接摸一张牌', [list, 'vcard']],
				function (button) {
					return _status.event.player.getUseValue({ name: button.link[2], nature: button.link[3] });
				},
				function (button) {
					return _status.event.player.hasUseTarget({ name: button.link[2], nature: button.link[3] });
				},
			);

			('step 2');
			if (!result.bool) {
				player.draw();

				event.goto(4);
			} else {
				event._result = player.chooseUseTarget({ name: result.links[0][2], nature: result.links[0][3] }, false);
			}
			('step 3');
			if (!result.bool) {
				player.draw();
			}
			('step 4');
			if (event.count < event.color.length) {
				event.goto(1);
			}
		},
	},
	yb017_zuigui: {
		audio: 'ext:夜白神略/audio/character:1',
		forced: true,
		trigger: {
			player: 'phaseDiscardBegin',
		},
		content() {
			player.chooseUseTarget({ name: 'jiu' }, true, false);
		},
		mod: {
			cardUsable(card, player, num) {
				if (card.name == 'jiu') {
					return Infinity;
				}
			},
		},
		group: ['yb017_zuigui_jiu', 'yb017_zuigui_jiu2', 'yb017_zuigui_jiu3'],
		subSkill: {
			jiu: {
				audio: 'yb017_zuigui',
				trigger: { player: 'jiuBegin' },
				forced: true,
				filter(event, player) {
					return event.parent.name == 'useCard';
				},
				content() {
					trigger.setContent(lib.skill.yb017_zuigui_jiu.jiuContent);
				},
				jiuContent() {
					if (typeof event.baseDamage != 'number') {
						event.baseDamage = 1;
					}

					target.recover(event.baseDamage);

					game.addVideo('jiuNode', target, true);
					if (cards && cards.length) {
						event.card = cards[0];
					}
					if (!target.storage.jiu) {
						target.storage.jiu = 0;
					}
					target.storage.jiu += event.baseDamage;
					game.broadcastAll(
						function (target, card, gain2) {
							target.addSkill('jiu');
							if (!target.node.jiu && lib.config.jiu_effect) {
								target.node.jiu = ui.create.div('.playerjiu', target.node.avatar);
								target.node.jiu2 = ui.create.div('.playerjiu', target.node.avatar2);
							}
							if (gain2 && card.clone && (card.clone.parentNode == target.parentNode || card.clone.parentNode == ui.arena)) {
								card.clone.moveDelete(target);
							}
						},
						target,
						event.card,
						target == targets[0] && cards.length == 1,
					);
					if (target == targets[0] && cards.length == 1) {
						if (event.card.clone && (event.card.clone.parentNode == target.parentNode || event.card.clone.parentNode == ui.arena)) {
							game.addVideo('gain2', target, get.cardsInfo([event.card]));
						}
					}
				},
			},
			jiu3: {
				audio: 'yb017_zuigui',
				trigger: { player: 'useCard1' },
				filter(event, player) {
					if (!player.hasSkill('jiu')) {
						return false;
					}
					return event.card && event.card.name != 'sha' && get.tag(event.card, 'damage') > 0;
				},
				forced: true,
				charlotte: true,
				firstDo: true,
				content() {
					if (!trigger.baseDamage) {
						trigger.baseDamage = 1;
					}
					trigger.baseDamage += player.storage.jiu;
					trigger.jiu = true;
					trigger.jiu_add = player.storage.jiu;
					game.addVideo('jiuNode', player, false);
					game.broadcastAll(function (player) {
						player.removeSkill('jiu');
					}, player);
				},
				temp: true,
				silent: true,
				popup: false,
				nopop: true,
				onremove(player) {
					if (player.node.jiu) {
						player.node.jiu.delete();
						player.node.jiu2.delete();
						delete player.node.jiu;
						delete player.node.jiu2;
					}
					delete player.storage.jiu;
				},
				ai: {
					damageBonus: true,
				},
			},
			jiu2: {
				trigger: { player: 'useCardAfter', global: 'phaseAfter' },
				_priority: 2,
				firstDo: true,
				charlotte: true,
				filter(event, player) {
					if (!player.hasSkill('jiu')) {
						return false;
					}
					if (player.hasSkillTag('jiuSustain', null, event.name)) {
						return false;
					}
					if (event.name == 'useCard') {
						return event.card && event.card.name != 'sha' && get.tag(event.card, 'damage') > 0;
					}
					return true;
				},
				forced: true,
				popup: false,
				content() {
					game.broadcastAll(function (player) {
						player.removeSkill('jiu');
					}, player);
					game.addVideo('jiuNode', player, false);
				},
			},
		},
	},

	yb017_mizhu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseBefore',
			player: 'enterGame',
		},
		forced: true,
		filter(event, player) {
			return (event.name != 'phase' || game.phaseNumber == 0) && !lib.inpile.includes('ybsl_lumingqianzhuan');
		},
		content() {
			game.addGlobalSkill('yb017_mizhu_global');
			for (let i = 2; i < 10; i++) {
				let card = game.createCard2('ybsl_lumingqianzhuan', i % 2 ? 'club' : 'spade', i);
				ui.cardPile.insertBefore(card, ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length)]);
			}
			game.broadcastAll(function () {
				lib.inpile.add('ybsl_lumingqianzhuan');
			});
			game.updateRoundNumber();
		},
		group: ['yb017_mizhu_remove', 'yb017_mizhu_rewrite'],
		derivation: 'ybsl_lumingqianzhuan',
		subSkill: {
			remove: {
				audio: 'yb017_mizhu',
				trigger: {
					target: 'useCardToBefore',
				},
				forced: true,
				_priority: 15,
				filter(event, player) {
					return event.card && event.card.name == 'ybsl_lumingqianzhuan';
				},
				content() {
					trigger.cancel();
				},
				ai: {
					target(card, player, target) {
						if (card && card.name == 'ybsl_lumingqianzhuan') {
							return 'zerotarget';
						}
					},
				},
			},
			global: {
				trigger: {
					player: 'useCardToPlayered',
				},
				forced: true,
				popup: false,
				filter(event, player) {
					return event.card && event.card.name == 'ybsl_lumingqianzhuan';
				},
				content() {
					'step 0';
					let target = trigger.target;
					event.target = target;
					player
						.chooseControl('喜啼', '悲鸣')
						.set('prompt', '请选择' + get.translation(target) + '的标记')
						.set(
							'choice',
							(function () {
								let e1 = 1.5 * get.sgn(get.damageEffect(target, player, target));
								let e2 = 0;
								if (target.countGainableCards(player, 'h') > 0 && !target.hasSkillTag('noh')) {
									e2 = -1;
								}
								const es = target.getGainableCards(player, 'e');
								if (es.length) {
									e2 = Math.min(
										e2,
										(function () {
											let max = 0;
											for (const i of es) {
												max = Math.max(max, get.value(i, target));
											}
											return -max / 4;
										})(),
									);
								}
								if (Math.abs(e1 - e2) <= 0.3) {
									return Math.random() < 0.5 ? '喜啼' : '悲鸣';
								}
								if (e1 < e2) {
									return '喜啼';
								}
								return '悲鸣';
							})(),
						)
						.set('ai', function () {
							return _status.event.choice;
						});
					('step 1');
					const map = trigger.parent.customArgs,
						id = target.playerid;
					if (!map[id]) {
						map[id] = {};
					}
					map[id].ybsl_luming_name = result.control;
				},
			},
			rewrite: {
				audio: 'yb017_mizhu',
				trigger: {
					global: 'useCardToTargeted',
				},
				filter(event, player) {
					return event.card && event.card.name == 'ybsl_lumingqianzhuan';
				},
				logTarget: 'target',
				prompt2: '观看其手牌并修改<鹿鸣千转>标记',
				content() {
					'step 0';
					let target = trigger.target;
					event.target = target;
					if (player != target && target.countCards('h') > 0) {
						player.viewHandcards(target);
					}
					player
						.chooseControl('喜啼', '悲鸣')
						.set('prompt', '请选择' + get.translation(target) + '的标记')
						.set(
							'choice',
							(function () {
								const shas = target.getCards('h', 'sha'),
									shans = target.getCards('h', 'shan');
								let e1 = 1.5 * get.sgn(get.damageEffect(target, player, target));
								let e2 = 0;
								if (target.countGainableCards(player, 'h') > 0 && !target.hasSkillTag('noh')) {
									e2 = -1;
								}
								const es = target.getGainableCards(player, 'e');
								if (es.length) {
									e2 = Math.min(
										e2,
										(function () {
											let max = 0;
											for (const i of es) {
												max = Math.max(max, get.value(i, target));
											}
											return -max / 4;
										})(),
									);
								}
								if (get.attitude(player, target) > 0) {
									if (shas.length >= Math.max(1, shans.length)) {
										return '喜啼';
									}
									if (shans.length > shas.length) {
										return '悲鸣';
									}
									return e1 > e2 ? '喜啼' : '悲鸣';
								}
								if (shas.length) {
									e1 = -0.5;
								}
								if (shans.length) {
									e2 = -0.7;
								}
								if (Math.abs(e1 - e2) <= 0.3) {
									return Math.random() < 0.5 ? '喜啼' : '悲鸣';
								}
								const rand = Math.random();
								if (e1 < e2) {
									return rand < 0.1 ? '喜啼' : '悲鸣';
								}
								return rand < 0.1 ? '悲鸣' : '喜啼';
							})(),
						)
						.set('ai', () => _status.event.choice);
					('step 1');
					const map = trigger.parent.customArgs,
						id = target.playerid;
					if (!map[id]) {
						map[id] = {};
					}
					map[id].ybsl_luming_name = result.control;
					map[id].ybsl_luming_aibuff = get.attitude(player, target) > 0;
				},
				audioname2: {},
			},
		},
	},
	yb017_guangzhu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'useCard',
		},
		forced: true,
		filter(event, player) {
			return (event.card.name == 'ybsl_lumingqianzhuan' || get.zhinangs().includes(event.card.name) || player.getStorage('yb017_zhenshi').includes(event.card.name)) && event.card.isCard && event.cards.length == 1;
		},
		content() {
			player.draw();
		},
	},
	yb017_zhenshi: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			target: 'useCardToTarget',
		},
		forced: true,
		filter(event, player) {
			return get.type2(event.card) == 'trick' && !player.getStorage('yb017_zhenshi').includes(event.card.name);
		},
		content() {
			player.markAuto('yb017_zhenshi', [trigger.card.name]);
			trigger.targets.remove(player);
			trigger.parent.triggeredTargets2.remove(player);
			trigger.untrigger();
		},
		intro: {
			content: '已记录牌名:$',
		},
		group: 'yb017_zhenshi_add',
		subSkill: {
			add: {
				trigger: {
					player: 'phaseBegin',
				},
				forced: true,
				content() {
					'step 0';
					const dialog = [get.prompt('yb017_zhenshi')];
					const list1 = player.getStorage('yb017_zhenshi');
					const list2 = lib.inpile.filter(function (i) {
						return get.type2(i, false) == 'trick' && !list1.includes(i);
					});
					if (list1.length) {
						dialog.push('<div class="text center">已记录</div>');
						dialog.push([list1, 'vcard']);
					}
					if (list2.length) {
						dialog.push('<div class="text center">未记录</div>');
						dialog.push([list2, 'vcard']);
					}
					player.chooseButton(dialog).set('ai', function (button) {
						let player = _status.event.player,
							name = button.link[2];
						if (player.getStorage('yb017_zhenshi').includes(name)) {
							return -get.effect(player, { name: name }, player, player);
						} else {
							return get.effect(player, { name: name }, player, player) * (1 + player.countCards('hs', name));
						}
					});
					('step 1');
					if (result.bool) {
						let name = result.links[0][2];
						if (player.getStorage('yb017_zhenshi').includes(name)) {
							player.unmarkAuto('yb017_zhenshi', [name]);
							game.log(player, '从贞侍记录中移除了', '#y' + get.translation(name));
						} else {
							player.markAuto('yb017_zhenshi', [name]);
							game.log(player, '向贞侍记录中添加了', '#y' + get.translation(name));
						}
					}
				},
				audioname2: {},
			},
		},
	},

	yb018_huaimeng: {
		audio: 'ext:夜白神略/audio/character:2',
		marktext: '梦',
		trigger: {
			global: 'roundStart',
		},
		forced: true,
		content() {
			'step 0';
			player
				.chooseControl(lib.suit)
				.set('prompt', '怀梦:请选择一种花色,接下来这轮因此花色获得的梦改为三枚')
				.set('ai', function (event) {
					switch (Math.floor(Math.random() * 8)) {
						case 0:
						case 6:
						case 3:
							return 'heart';
						case 1:
						case 4:
						case 5:
							return 'diamond';
						case 2:
							return 'club';
						case 7:
							return 'spade';
					}
				});
			('step 1');
			player.storage.YB_memorysuit = result.control;
			player.popup(player.storage.YB_memorysuit + 2);
			game.log(player, '铭记了', player.storage.YB_memorysuit + 2);
		},
		init(player, skill) {
			player.addMark('yb018_huaimeng', 5);
		},
		intro: {
			name: '梦',
			content(storage, player) {
				let str = '<li>纪念着';
				str += get.translation(player.countMark('yb018_huaimeng'));
				str += '段过往<br><li>印象最深刻的是';
				str += get.translation(player.storage.YB_memorysuit);
				str += '<br><li>这次已梦见';
				str += get.translation(player.storage.losesuit);
				return str;
			},
		},
		group: ['yb018_huaimeng_2', 'yb018_huaimeng_3'],
		subSkill: {
			2: {
				forced: true,
				trigger: {
					global: 'phaseBefore',
				},
				content() {
					'step 0';
					player.storage.losesuit = [];
				},
			},
			3: {
				forced: true,
				trigger: {
					player: ['useCardBegin', 'respondBegin'],
				},
				filter(event, player, card) {
					if (!player.storage.losesuit) {
						player.storage.losesuit = [];
					}
					return !player.storage.losesuit.includes(event.card.suit);
				},
				content() {
					'step 0';
					event.suit = trigger.card.suit;
					if (event.suit == player.storage.YB_memorysuit) {
						player.addMark('yb018_huaimeng', 3);
						game.log(player, '再逢故人,觅得三载光阴');
					} else {
						player.addMark('yb018_huaimeng');
						game.log(player, '重拾旧物,忆起一段过往');
					}
					('step 1');
					player.storage.losesuit.add(event.suit);
				},
			},
		},
	},
	yb018_minxing: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['phaseZhunbeiBegin', 'phaseJieshuAfter'],
		},
		filter(event, player) {
			if (player.hasSkill('yb018_minxing_buff')) {
				return player.countMark('yb018_huaimeng') >= 2;
			}
			return true;
		},
		content() {
			'step 0';

			player.removeMark('yb018_huaimeng', 2);

			('step 1');
			let list = [];
			if (player.hasMark('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 2) {
				list.push('两枚');
			}
			if (player.hasMark('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 1) {
				list.push('一枚');
			}
			list.push('不移除');
			player.chooseControl(list).set('choiceList', ['移除两枚梦,然后摸五放五', '移除一枚梦,然后摸四放四', '不移除梦,然后摸三放三']).set('prompt', '请选择');
			('step 2');
			let nuk;
			if (result.control == '两枚') {
				nuk = 2;
			}
			if (result.control == '一枚') {
				nuk = 1;
			}
			if (result.control == '不移除') {
				nuk = 0;
			}
			const nur = 3 + nuk;
			event.numb = nur;
			player.removeMark('yb018_huaimeng', nuk);
			player.draw(nur);
			player
				.chooseCard(nur, 'h', '请选择' + nur + '张手牌', true)
				.set('complexCard', true)
				.set('ai', function (card) {
					if (ui.selected.cards.length) {
						if (ui.selected.cards[ui.selected.cards.length - 1].suit == card.suit) {
							return 10;
						}
					} else {
						return 6 - get.value(card);
					}
				});
			result.cards;
			('step 3');
			event.cards = result.cards;

			const next = player.chooseToMove('将牌按照顺序置于牌堆顶', true);
			let list1 = [['待选择牌', event.cards]];
			list1.push(['牌堆顶', []]);
			next.set('list', list1);
			next.set('selectButton', function (buttons) {
				return buttons.slice(0, 1);
			});
			next.set('filterOk', function (moved) {
				return moved[0].length == 0;
			});
			next.set('processAI', (list) => {
				let cards = list[0][1],
					cards1 = list[1][1];

				const player = _status.event.player;
				if (player.countMark('yb018_huaimeng') >= 2) {
					const number = {
						club: 0,
						spade: 0,
						diamond: 0,
						heart: 0,
					};

					for (const i of cards) {
						number[i.suit]++;
					}

					let num = [];
					for (let i in number) {
						num.push(number[i]);
					}
					const maxnum = Math.max(...num);

					for (let i in number) {
						if (number[i] == maxnum) {
							for (const o of cards) {
								if (o.suit == i) {
									cards1.add(o);
								}
							}
							for (const o of cards1) {
								cards.remove(o);
							}
						}
					}
				}
				cards.sort(function (a, b) {
					return get.value(b, player) - get.value(a, player);
				});

				for (const o of cards) {
					cards1.add(o);
				}

				return [[], cards1];
			});
			game.log(player, '将' + event.numb + '张牌盖在了牌堆顶');
			('step 4');
			let list2 = result.moved[1].slice(0);
			while (list2.length) {
				ui.cardPile.insertBefore(list2.pop(), ui.cardPile.firstChild);
			}
			('step 5');
			const lista = ['是', 'cancel'];

			player.chooseControl(lista).set('prompt', '是否展示牌堆顶三张牌,并根据花色数获得收益');
			('step 6');
			if (result.control == '是') {
				let cards = get.cards(3);
				event.cards = cards;

				const suit = [];
				for (let t = 0; t < 3; t++) {
					const huase = cards[t].suit;
					if (!suit.includes(huase)) {
						suit.push(huase);
					}
				}
				if (cards[0].suit == cards[1].suit) {
					event.y = cards[2];
				}
				if (cards[0].suit == cards[2].suit) {
					event.y = cards[1];
				}
				if (cards[2].suit == cards[1].suit) {
					event.y = cards[0];
				}

				event.u = suit.length;
				game.cardsGotoOrdering(event.cards);
				player.showCards(event.cards, get.translation(player) + '展示了牌堆顶的三张牌');
				player.$throw(event.cards, 1000);
				player.loseToDiscardpile(event.cards);
			} else {
				event.goto(9);
			}
			('step 7');
			const listb = [];
			if (event.u == 1) {
				listb.push('选项一');
				if (player.hp < player.maxHp) {
					listb.push('选项二');
				}
				if (player.hp < player.maxHp && player.hasSkill('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 2) {
					listb.push('背水!');
				}
			}
			if (event.u == 2) {
				listb.push('选项四');
				listb.push('选项五');
				if (player.hasSkill('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 1) {
					listb.push('背水');
				}
			}
			player
				.chooseControl(listb)
				.set('choiceList', ['<span class=yellowtext>摸两张牌</span>', '<span class=yellowtext>回复1点体力</span>', '背水!消耗<span class=yellowtext>两</span>枚梦', '<span class=yellowtext>摸一张牌</span>', '<span class=yellowtext>获得仅有一张的花色的牌</span>', '背水:消耗<span class=yellowtext>一</span>枚梦'])
				.set('prompt', '<span class=yellowtext>请选择</span>')
				.set('ai', function () {
					const player = _status.event.player;
					return listb.length - 1;
				});
			('step 8');
			if (result.control == '选项一') {
				player.draw(2);
			}
			if (result.control == '选项二') {
				player.recover();
			}
			if (result.control == '背水!') {
				player.removeMark('yb018_huaimeng', 2);
				player.draw(2);
				player.recover();
			}
			if (result.control == '选项四') {
				player.draw();
			}
			if (result.control == '选项五') {
				player.gain(event.y, 'gain2');
			}
			if (result.control == '背水') {
				player.removeMark('yb018_huaimeng');
				player.draw();
				player.gain(event.y, 'gain2');
			}
		},
		subSkill: {
			add: {
				charlotte: true,
				forced: true,
				mark: true,
				marktext: '悯',
				intro: {
					content: '本回合已发动过悯星,再次发动需要两枚梦',
				},
			},
			buff: {
				charlotte: true,
				forced: true,
				mark: true,
				marktext: '追',
				intro: {
					content: '本回合已发动过悯星的追加效果,故而无法再次发动',
				},
			},
		},
		ai: {
			threaten: 1.3,
		},
	},
	yb018_fanling: {
		mark: true,
		marktext: '灵',
		charlotte: true,
		intro: {
			content(storage, player, skill) {
				if (player.storage.yb018_fanling == true) {
					return '当前为栖月形态';
				}
				return '当前为折叶形态';
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'roundStart',
		},
		forced: true,
		filter(event, player) {
			if (game.roundNumber > 1) {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			player.chooseControl('栖月', '折叶').set('prompt', '请选择起始状态');
			('step 1');
			if (result.control == '栖月') {
				player.storage.yb018_fanling = true;
				player.addTempSkill('yb018_qiyue', 'roundStart');
				player.addSkill('yb018_fanling1');
			}
			if (result.control == '折叶') {
				player.storage.yb018_fanling = false;
				player.addTempSkill('yb018_zheye', 'roundStart');
				player.addSkill('yb018_fanling1');
			}
		},
		init(player) {
			player.storage.yb018_fanling = true;
		},
		derivation: ['yb018_zheye', 'yb018_qiyue'],
		group: ['yb018_fanling_1'],
		subSkill: {
			1: {
				audio: 'eyb018_fanling',
				trigger: {
					global: 'roundStart',
				},
				forced: true,
				filter(event, player) {
					if (game.roundNumber == 1) {
						return false;
					}
					if (!player.countMark('yb018_huaimeng') >= 1) {
						return false;
					}
					return true;
				},
				content() {
					'step 0';
					player.removeMark('yb018_huaimeng');
					('step 1');
					if (player.storage.yb018_fanling == true) {
						player.storage.yb018_fanling = false;
						player.addTempSkill('yb018_zheye', 'roundStart');
					} else {
						player.storage.yb018_fanling = true;
						player.addTempSkill('yb018_qiyue', 'roundStart');
					}
				},
			},
		},
	},
	yb018_zheye: {
		audio: 'ext:夜白神略/audio/character:2',
		audioname2: {
			ybsp_002chenailin: 'yb002_zheye',
			ybsl_005wangruobing: 'yb005_zheye',
			ybsl_010zhouyue: 'yb010_zheye',
		},
		trigger: {
			player: ['changeHp'],
		},
		forced: true,
		content() {
			event.num = Math.abs(trigger.num);
			player.draw(event.num);
		},
	},
	yb018_qiyue: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: ['phaseZhunbeiBegin', 'phaseJieshuAfter'],
		},
		forced: true,
		content() {
			'step 0';
			if (event.triggername == 'phaseJieshuAfter') {
				player.draw(2);
				event.finish();
			}
			('step 1');
			if (player.hasMark('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 1) {
				return player
					.chooseControl('打牌', '弃梦')
					.set('prompt', '请选择打出一张牌或移除一枚<梦>')
					.set('ai', function () {
						if (player.countMark('yb018_huaimeng') > 3) {
							return '弃梦';
						}
						return '打牌';
					});
			} else {
				player.chooseControl('打牌').set('prompt', '你没有梦,请点击打牌');
			}
			('step 2');
			if (result.control == '弃梦') {
				player.removeMark('yb018_huaimeng', 1);
			}
			if (result.control == '打牌') {
				if (player.countCards('he') > 0) {
					player.chooseToRespond('he', true).set('ai', function (card) {
						if (player.storage.YB_memorysuit && card.suit == player.storage.YB_memorysuit) {
							return 3;
						}
						return 1;
					});
				}
			}
		},
	},

	yb018_isi: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.maxHp < 10;
		},
		content() {
			'step 0';
			event.cards = [];
			event.suits = [];
			('step 1');
			player
				.judge(function (result) {
					let evt = _status.event.getParent('yb018_isi');
					if (evt && evt.suits && evt.suits.includes(result.suit)) {
						return 0;
					}
					return 1;
				})
				.set('callback', function () {
					event.parent.orderingCards.remove(event.judgeResult.card);
				}).judge2 = function (result) {
					return result.bool ? true : false;
				};
			('step 2');
			event.cards.push(result.card);
			if (result.bool && player.maxHp < 10) {
				event.suits.push(result.suit);
				player.gainMaxHp();
				event.goto(1);
			} else {
				event.cards = event.cards.filterInD();
				if (event.cards.length) {
					player.chooseTarget('将' + get.translation(event.cards) + '交给一名角色', true).set('ai', function (target) {
						const player = _status.event.player;
						let att = get.attitude(player, target) / Math.sqrt(1 + target.countCards('h'));
						if (target.hasSkillTag('nogain')) {
							att /= 10;
						}
						return att;
					});
				} else {
					event.finish();
				}
			}
			('step 3');
			if (result.bool) {
				let target = result.targets[0];
				event.target = target;
				player.line(target, 'green');
				target.gain(event.cards, 'gain2');
			}
			('step 4');
			if (target.isMaxHandcard()) {
				player.loseMaxHp();
			}
		},
		ai: {
			order: 1,
			result: {
				player: 1,
			},
			threaten: 2,
		},
	},
	yb018_newisi: {
		audio: 'yb018_isi',
		enable: 'phaseUse',
		usable: 1,
		forced: true,
		filter(event, player) {
			return player.maxHp < 10;
		},
		content() {
			'step 0';
			event.cards = [];
			event.suits = [];
			('step 1');
			player
				.judge(function (result) {
					let evt = _status.event.getParent('yb018_newisi');
					if (evt && evt.suits && evt.suits.includes(result.suit)) {
						return 0;
					}
					return 1;
				})
				.set('callback', lib.skill.yb018_newisi.callback).judge2 = function (result) {
					return result.bool ? true : false;
				};
			('step 2');
			let cards = cards.filterInD();
			if (cards.length) {
				player
					.chooseTarget('将' + get.translation(cards) + '交给一名角色', true)
					.set('ai', function (target) {
						let player = _status.event.player,
							att = get.attitude(player, target);
						if (att <= 0) {
							return att;
						}
						if (target.countCards('h') + _status.event.num >= _status.event.max) {
							att /= 3;
						}
						if (target.hasSkillTag('nogain')) {
							att /= 10;
						}
						return att;
					})
					.set('num', cards.length)
					.set(
						'max',
						game.filterPlayer().reduce((num, i) => {
							return Math.max(num, i.countCards('h'));
						}, 0),
					);
			} else {
				event.finish();
			}
			('step 3');
			if (result.bool) {
				let target = result.targets[0];
				event.target = target;
				player.line(target, 'green');
				target.gain(cards, 'gain2').giver = player;
			} else {
				event.finish();
			}
			('step 4');
			if (target.isMaxHandcard()) {
				player.loseMaxHp();
			}
		},
		callback() {
			'step 0';
			let evt = event.getParent(2);
			event.parent.orderingCards.remove(event.judgeResult.card);
			evt.cards.push(event.judgeResult.card);
			if (event.parent.result.bool && player.maxHp < 10) {
				evt.suits.push(event.parent.result.suit);
				player.gainMaxHp();
				player.chooseBool('是否继续发动【懿思】？').set('frequentSkill', 'yb018_newisi');
			} else {
				event._result = { bool: false };
			}
			('step 1');
			if (result.bool) {
				event.getParent(2).redo();
			}
		},
		ai: {
			order: 9,
			result: {
				player: 1,
			},
		},
	},
	yb018_chongmeng: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		forced: true,
		juexingji: true,
		filter(event, player) {
			if (player.storage.yb018_yisi) {
				return true;
			}
			return this.yb018_guajian_filter.apply(this, arguments);
		},
		content() {
			'step 0';
			player.awakenSkill('yb018_chongmeng');
			player.gainMaxHp(2);
			player.recover();
			('step 1');
			player.chooseTarget(true, '令一名角色获得技能〖释罔〗').set('ai', function (target) {
				return get.attitude(_status.event.player, target);
			});
			('step 2');
			if (result.bool) {
				let target = result.targets[0];
				player.line(target, 'green');
				target.storage.yb018_shiwang = player;
				target.addSkill('yb018_shiwang');
			}
		},
		derivation: 'yb018_shiwang',
		yb018_guajian_filter(event, player) {
			return !game.hasPlayer(function (current) {
				return current.getAllHistory('damage').length == 0;
			});
		},
	},
	yb018_yisi: {
		audio: 'ext:夜白神略:1',
		inherit: 'yb018_yisi',
		filterTarget: true,
		content() {
			'step 0';
			player.awakenSkill('yb018_yisi');
			let list = target.getSkills(null, false, false).filter(function (skill) {
				const info = lib.skill[skill];
				return info && info.juexingji && !target.awakenedSkills.includes(skill);
			});
			if (player.maxHp >= game.players.length && list.length) {
				if (list.length == 1) {
					event._result = { control: list[0] };
				} else {
					player.chooseControl(list).set('prompt', '选择一个觉醒技,令' + get.translation(target) + '可无视条件发动该技能');
				}
			} else {
				target.draw(4);
				event.goto(2);
			}
			('step 1');
			target.storage.yb018_yisi = result.control;
			target.markSkill('yb018_yisi');
			const info = lib.skill[result.control];
			if (info.filter && !info.charlotte && !info.yb018_guajian_filter) {
				info.yb018_guajian_filter = info.filter;
				info.filter = function (event, player) {
					if (player.storage.yb018_yisi) {
						return true;
					}
					return this.yb018_guajian_filter.apply(this, arguments);
				};
			}
			('step 2');
			player.loseMaxHp(2);
		},
		intro: {
			content: '发动【$】时无视条件',
		},
		ai: {
			order: 0.1,
			expose: 0.2,
			result: {
				target(player, target) {
					if ((target != player && player.hasUnknown()) || player.maxHp < (player.getDamagedHp() > 1 ? 5 : 6)) {
						return 0;
					}
					if (
						target == player &&
						player.hasSkill('yb018_yisi') &&
						game.hasPlayer(function (current) {
							return current.getAllHistory('damage').length == 0;
						})
					) {
						return 4;
					}
					let list = target.getSkills(null, false, false).filter(function (skill) {
						const info = lib.skill[skill];
						return info && info.juexingji && !target.awakenedSkills.includes(skill);
					});
					if (list.length || target.hasJudge('lebu') || target.hasSkillTag('nogain')) {
						return 0;
					}
					return 4;
				},
			},
		},
		enable: 'phaseUse',
		limited: true,
		mark: true,
		init(player, skill) {
			player.storage[skill] = false;
		},
	},
	yb018_guajian: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		limited: true,
		filterTarget(card, player, target) {
			return player != target;
		},
		content() {
			'step 0';
			player.awakenSkill('yb018_guajian');
			let list = target.getSkills(null, false, false).filter(function (skill) {
				const info = lib.skill[skill];
				return info && info.juexingji;
			});
			if (list.length) {
				target.addMark('yb018_guajian', 1, false);
				for (const i of list) {
					const info = lib.skill[i];
					if (info.filter && !info.charlotte && !info.yb018_guajian_filter) {
						info.yb018_guajian_filter = info.filter;
						info.filter = function (event, player) {
							if (player.hasMark('yb018_guajian')) {
								return true;
							}
							return this.yb018_guajian_filter.apply(this, arguments);
						};
					}
				}
			} else {
				target.draw(4);
			}
			player.loseMaxHp(2);
		},
		intro: {
			content: '发动非Charlotte觉醒技时无视条件',
		},
		ai: {
			order: 0.1,
			expose: 0.2,
			result: {
				target(player, target) {
					if (player.hasUnknown() || player.maxHp < 5) {
						return 0;
					}
					let list = target.getSkills(null, false, false).filter(function (skill) {
						const info = lib.skill[skill];
						return info && info.juexingji;
					});
					if (list.length || target.hasJudge('lebu') || target.hasSkillTag('nogain')) {
						return 0;
					}
					return 4;
				},
			},
		},
		mark: true,
		init(player, skill) {
			player.storage[skill] = false;
		},
	},
	yb018_shiwang: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		filter(event, player) {
			let target = player.storage.yb018_shiwang;
			return target && target.isAlive() && target.maxHp > 1;
		},
		logTarget(event, player) {
			return player.storage.yb018_shiwang;
		},
		check(event, player) {
			let target = player.storage.yb018_shiwang;
			if (get.attitude(player, target) <= 0) {
				return true;
			}
			return target.maxHp > 3 && !player.hasJudge('lebu');
		},
		content() {
			player.storage.yb018_shiwang.loseMaxHp();
			player.addTempSkill('yb018_shiwang2');
		},
	},
	yb018_shiwang2: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			for (const i of lib.inpile) {
				if (get.type(i) == 'trick' && event.filterCard({ name: i }, player, event)) {
					return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];
				for (const i of lib.inpile) {
					if (get.type(i) == 'trick' && event.filterCard({ name: i }, player, event)) {
						list.push(['锦囊', '', i]);
					}
				}
				return ui.create.dialog('释罔', [list, 'vcard']);
			},
			check(button) {
				return _status.event.player.getUseValue({ name: button.link[2] });
			},
			backup(links, player) {
				return {
					viewAs: {
						name: links[0][2],
					},
					filterCard: () => false,
					selectCard: -1,
					popname: true,
					precontent() { },
				};
			},
			prompt(links, player) {
				return '请选择' + get.translation(links[0][2]) + '的目标';
			},
		},
		ai: {
			order: 1,
			result: {
				player: 1,
			},
		},
	},

	yb018_yinsi: {
		derivation: ['dz017_shanwu', 'dz014_qingling', 'dz017_zhushi'],

		group: ['yb018_yinsia', 'yb018_yinsib', 'yb018_yinsic', 'yb018_yinsid'],
	},
	yb018_yinsia: {
		audio: 'ext:夜白神略:1',
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		filter(event, player) {
			if (player.hasMark('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 2) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			player.chooseControl('是', '否').set('prompt', '是否移除两枚>梦<,然后卜算3？');
			('step 1');
			const jg = result.control;
			if (jg == '是') {
				player.removeMark('yb018_huaimeng', 2);
				player.chooseToGuanxing(3);
			} else {
				event.finish();
			}
		},
	},
	yb018_yinsib: {
		audio: 'ext:夜白神略:1',
		trigger: {
			player: 'phaseDrawBefore',
		},
		filter(event, player) {
			if (player.hasMark('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 1) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			player.chooseControl('是', '否').set('prompt', '是否移除一枚>梦<,然后多摸一张牌？');
			('step 1');
			const jg = result.control;
			if (jg == '是') {
				player.removeMark('yb018_huaimeng', 1);
				trigger.num++;
				game.log(player, '多摸了一张牌');
			} else {
				event.finish;
			}
		},
	},
	yb018_yinsic: {
		audio: 'ext:夜白神略:1',
		trigger: {
			player: 'phaseUseBegin',
		},
		filter(event, player) {
			if (player.hasMark('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 2) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			player.chooseControl('是', '否').set('prompt', '是否移除两枚>梦<,然后本回合获得【善舞】？');
			('step 1');
			const jg = result.control;
			if (jg == '是') {
				player.removeMark('yb018_huaimeng', 2);
				player.addTempSkill('dz017_shanwu');
				game.log(player, ':当初我跳舞时,那小子看我直勾勾的');
			} else {
				event.finish();
			}
		},
	},
	dz018_shanwu: {
		inherit: 'dz017_shanwu',
		audio: 'ext:夜白神略/audio/character:1',
	},
	yb018_yinsid: {
		audio: 'ext:夜白神略:1',
		trigger: {
			player: 'phaseJieshuBefore',
		},
		filter(event, player) {
			if (player.hasMark('yb018_huaimeng') && player.countMark('yb018_huaimeng') >= 2) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			player.chooseControl('是', '否').set('prompt', '是否移除两枚>梦<,然后获得【注视】和【轻灵】直到下回合开始？');
			('step 1');
			const jg = result.control;
			if (jg == '是') {
				player.removeMark('yb018_huaimeng', 2);
				player.addTempSkill('dz018_zhushi', { player: 'phaseZhunbeiBefore' });
				player.addTempSkill('dz018_qingling', { player: 'phaseZhunbeiBefore' });
			} else {
				event.finish();
			}
		},
	},
	dz018_qingling: {
		inherit: 'dz014_qingling',
		audio: 'ext:夜白神略/audio/character:1',
	},
	dz018_zhushi: {
		inherit: 'dz017_zhushi',
		audio: 'ext:夜白神略/audio/character:1',
	},

	yb018_tongmou: {
		audio: 'ext:夜白神略/audio/character:2',
		init(player, skill) {
			player.storage[skill] = [[], [], [], [], []];
			player.markSkill(skill);
		},
		enable: 'phaseUse',
		trigger: {
			player: 'changeSkillsAfter',
		},
		usable: 1,
		forced: true,
		filter: (event) => event.name == 'chooseToUse' || event.addSkill.includes('yb018_tongmou'),
		async content(event, trigger, player) {
			async function addCards(bool) {
				const num = player.countExpansions(event.name);
				const cards = get.cards(25 - num);
				const next = player.addToExpansion(cards, player);
				next.gaintag.add(event.name);
				await next;
				if (bool) {
					const xs = player.getExpansions(event.name);
					player.storage[event.name] = [xs.slice(0, 5), xs.slice(5, 10), xs.slice(10, 15), xs.slice(15, 20), xs.slice(20, 25)];
				}
			}
			if (trigger?.name == 'changeSkills') {
				const num = player.countExpansions(event.name);

				if (num > 0) {
					player.say('诶？上次玩完没放回去吗？');
				}
				if (num == 25) {
					return;
				}
				await addCards(true);

				return;
			} else {
				const num = player.countExpansions(event.name);

				if (num < 25) {
					player.say('诶？我忘放牌了吗？洗一下吧');
					await addCards(true);
				}
				const storage = player.storage[event.name];
				const dialog = ui.create.dialog();
				dialog.classList.add('fixed');
				dialog.classList.add('scroll1');
				dialog.classList.add('scroll2');
				dialog.classList.add('fullwidth');
				dialog.classList.add('fullheight');
				dialog.classList.add('noupdate');
				const tip = ui.create.div('.select-all.popup.pointerdiv', dialog.contentContainer);
				tip.innerHTML = `${get.poptip(event.name + '_tip')}`;

				dialog.matched = [];
				for (let x = 0; x < 5; x++) {
					for (let y = 0; y < 5; y++) {
						const card = ui.create.card(ui.special, 'noclick', true);
						card.init(storage[x][y]);
						card.x = x;
						card.y = y;
						card.link = storage[x][y];
						let str = '';
						for (const nature of getNatures(card)) {
							if (nature == 'other') {
								str += '◈';
							} else {
								str += get.translation(nature);
							}
						}
						card.node.gaintag.innerHTML = str;
						card.addEventListener(lib.config.touchscreen ? 'touchstart' : 'mousedown', click);
						card.style.position = 'absolute';
						card.style.opacity = 0;

						const glow = {
							heart: 'dctuoyu-qingqu-glow',
							spade: 'dctuoyu-junshan-glow',
							diamond: 'dctuoyu-fengtian-glow',
							club: 'YB-zqxxl-zise',
						};
						card.classList.add(glow[card.suit]);
						dialog.contentContainer.appendChild(card);
					}
				}
				function update(bool) {
					const card = ui.create.card(ui.special, 'noclick', true);
					card.style.opacity = 0;
					dialog.contentContainer.appendChild(card);
					ui.refresh(card);
					const dw = dialog.contentContainer.offsetWidth,
						dh = dialog.contentContainer.offsetHeight,
						cw = card.offsetWidth,
						ch = card.offsetHeight;
					card.remove();
					const scale = Math.min(dw / cw / 6, dh / ch / 8);
					const left = dw / 2 - cw * 2 * scale - cw / 2,
						top = dh / 2 - ch * 3 * scale - ch / 2;
					const cards = Array.from(dialog.contentContainer.childNodes).filter((i) => get.itemtype(i) == 'card');
					for (const button of cards) {
						if (get.itemtype(button) != 'card') {
							continue;
						}
						const { x, y } = button;
						button.style.transform = `scale(${scale * 100}%)`;
						if (bool === true) {
							button.style.transitionDuration = '0.05s';
						}
						if (get.itemtype(bool) == 'card' && button != bool) {
							continue;
						}
						if (dialog.matched.includes(button)) {
							const len = Math.max(5, dialog.matched.length);
							const index = dialog.matched.indexOf(button);
							button.style.transitionDuration = '0.75s';
							button.style.left = left + (cw * scale * index * 5) / len + 'px';
							button.style.top = top + ch * scale * 6 + 'px';
							button.style.zIndex = index + '';
						} else {
							button.style.left = left + cw * scale * x + 'px';
							button.style.top = top + ch * scale * y + 'px';
						}
						ui.refresh(button);
						button.style.opacity = 1;
					}
				}
				function click() {
					if (dialog.isBusy) {
						return;
					}
					if (dialog.matched.includes(this)) {
						return;
					}
					if (!dialog.selectedCard) {
						this.classList.add('selected');
						dialog.selectedCard = this;
					} else if (dialog.selectedCard == this) {
						delete dialog.selectedCard;
						this.classList.remove('selected');
					} else if (isAdj(dialog.selectedCard, this)) {
						swapCard(dialog.selectedCard, this);
						dialog.selectedCard.classList.remove('selected');
						delete dialog.selectedCard;
					} else {
						dialog.selectedCard.classList.remove('selected');
						this.classList.add('selected');
						dialog.selectedCard = this;
					}
				}
				function getNatures(...cards) {
					const natures = [];
					const naturex = ['fire', 'thunder', 'kami', 'ice', 'YB_wind', 'YB_snow'];
					for (const card of cards) {
						for (const [nature] of lib.nature) {
							if (get.tag(card, nature + 'Damage')) {
								if (naturex.includes(nature)) {
									natures.add(nature);
								} else {
									natures.add('other');
								}
							}
						}
					}
					return natures;
				}
				function isAdj(card1, card2) {
					if ([card1, card2].some((card) => dialog.matched.includes(card))) {
						return false;
					}
					if (Math.abs(card1.x - card2.x) + Math.abs(card1.y - card2.y) == 1) {
						return true;
					}
					if (getNatures(card1, card2).includes('YB_wind')) {
						return true;
					}
					return false;
				}

				function checkSwap(card1, card2) {
					if (!isAdj(card1, card2)) {
						return false;
					}
					function match(card1, card2) {
						[card1.x, card2.x, card1.y, card2.y] = [card2.x, card1.x, card2.y, card1.y];
						const cards = Array.from(dialog.contentContainer.childNodes).filter((i) => get.itemtype(i) == 'card');
						const matchx = [card2],
							matchy = [card2];
						const { x, y } = card2;
						for (let xx = x - 1; xx >= 0; xx--) {
							const cardx = cards.find((i) => i.x == xx && i.y == y);
							if (cardx.suit == card2.suit) {
								matchx.push(cardx);
							} else {
								break;
							}
						}
						for (let xx = x + 1; xx < 5; xx++) {
							const cardx = cards.find((i) => i.x == xx && i.y == y);
							if (cardx.suit == card2.suit) {
								matchx.push(cardx);
							} else {
								break;
							}
						}
						for (let yy = y - 1; yy >= 0; yy--) {
							const cardy = cards.find((i) => i.y == yy && i.x == x);
							if (cardy.suit == card2.suit) {
								matchy.push(cardy);
							} else {
								break;
							}
						}
						for (let yy = y + 1; yy < 5; yy++) {
							const cardy = cards.find((i) => i.y == yy && i.x == x);
							if (cardy.suit == card2.suit) {
								matchy.push(cardy);
							} else {
								break;
							}
						}
						[card1.x, card2.x, card1.y, card2.y] = [card2.x, card1.x, card2.y, card1.y];
						if (matchx.length > 2) {
							return true;
						}
						if (matchy.length > 2) {
							return true;
						}
						return false;
					}
					if (match(card1, card2)) {
						return true;
					}
					if (match(card2, card1)) {
						return true;
					}
					return false;
				}
				function matchCard() {
					const matched = [];
					const cards = Array.from(dialog.contentContainer.childNodes)
						.filter((i) => get.itemtype(i) == 'card')
						.filter((i) => !dialog.matched.includes(i));
					for (const card of cards) {
						if (matched.includes(card)) {
							continue;
						}
						const matchx = [card],
							matchy = [card];
						const { x, y } = card;
						for (let xx = x - 1; xx >= 0; xx--) {
							const cardx = cards.find((i) => i.x == xx && i.y == y);
							if (cardx.suit == card.suit) {
								matchx.push(cardx);
							} else {
								break;
							}
						}
						for (let xx = x + 1; xx < 5; xx++) {
							const cardx = cards.find((i) => i.x == xx && i.y == y);
							if (cardx.suit == card.suit) {
								matchx.push(cardx);
							} else {
								break;
							}
						}
						for (let yy = y - 1; yy >= 0; yy--) {
							const cardy = cards.find((i) => i.y == yy && i.x == x);
							if (cardy.suit == card.suit) {
								matchy.push(cardy);
							} else {
								break;
							}
						}
						for (let yy = y + 1; yy < 5; yy++) {
							const cardy = cards.find((i) => i.y == yy && i.x == x);
							if (cardy.suit == card.suit) {
								matchy.push(cardy);
							} else {
								break;
							}
						}
						if (matchx.length > 2) {
							matched.addArray(matchx);
						}
						if (matchy.length > 2) {
							matched.addArray(matchy);
						}
					}
					let ice = false;
					for (const card of matched) {
						const natures = getNatures(card);
						if (natures.includes('kami')) {
							matched.addArray(cards);
						}
						if (natures.includes('fire')) {
							matched.addArray(cards.filter((i) => i.y == card.y));
						}
						if (natures.includes('thunder')) {
							matched.addArray(cards.filter((i) => i.x == card.x));
						}
						if (natures.includes('YB_snow')) {
							matched.addArray(cards.filter((i) => Math.abs(i.y - card.y) + Math.abs(i.x - card.x) == 1));
						}
						if (natures.includes('other')) {
							matched.addArray(cards.filter((i) => i.suit == card.suit));
						}
						if (natures.includes('ice')) {
							ice = true;
						}
					}
					dialog.matched.addArray(matched);
					update();
					if (ice && cards.some((card) => cards.some((cardx) => isAdj(card, cardx)))) {
						setTimeout(() => {
							dialog.isBusy = false;
							if (!event.isMine()) {
								ai();
							}
							dialog.ice = true;
						}, 750);
					} else {
						let delay = 0.75;
						const add = get.cards(25 - cards.filter((i) => !dialog.matched.includes(i)).length);
						for (let x = 0; x < 5; x++) {
							const xs = cards.filter((i) => i.x == x && !dialog.matched.includes(i)).sort((a, b) => b.y - a.y);
							let len = xs.length;
							for (let i = 0; i < xs.length; i++) {
								const card = xs[i];
								const time = Math.abs(card.y - 4 + i) / 4;
								delay = Math.max(delay, time);
								card.style.transitionDuration = time + 's';
								card.y = 4 - i;
							}
							while (xs.length < 5) {
								const card = ui.create.card(ui.special, 'noclick', true);
								card.style.position = 'absolute';
								card.style.opacity = 0;
								card.addEventListener(lib.config.touchscreen ? 'touchstart' : 'mousedown', click);
								dialog.contentContainer.appendChild(card);
								card.style.transitionDuration = '0.05s';
								xs.push(card);
								card.link = add.shift();
								card.init(card.link);
								const glow = {
									heart: 'dctuoyu-qingqu-glow',
									spade: 'dctuoyu-junshan-glow',
									diamond: 'dctuoyu-fengtian-glow',
									club: 'YB-zqxxl-zise',
								};
								card.classList.add(glow[card.suit]);
								card.x = x;
								card.y = len - xs.length;
								let str = '';
								for (const nature of getNatures(card)) {
									if (nature == 'other') {
										str += '◈';
									} else {
										str += get.translation(nature);
									}
								}
								card.node.gaintag.innerHTML = str;
								update(card);
								const time = Math.abs(card.y - 5 + xs.length) / 4;
								delay = Math.max(delay, time);
								card.style.transitionDuration = time + 's';
								card.y = 5 - xs.length;
							}
						}
						update();
						setTimeout(
							matched.length || dialog.ice
								? matchCard
								: () => {
									dialog.matchAfter = true;
									game.resume();
								},
							delay * 1000,
						);
						dialog.ice = false;
					}
				}
				function swapCard(card1, card2) {
					dialog.isBusy = true;
					const time = Math.hypot(card1.x - card2.x, card1.y - card2.y) / 4;
					card1.style.transitionDuration = time + 's';
					card2.style.transitionDuration = time + 's';
					[card1.x, card2.x, card1.y, card2.y] = [card2.x, card1.x, card2.y, card1.y];
					update();
					setTimeout(() => {
						matchCard();
					}, time * 1000);
				}
				update(true);
				const resizeObserver = new ResizeObserver(() => update(true));
				resizeObserver.observe(dialog);
				if (!event.isMine()) {
					ai();
				}
				event.switchToAuto = function () {
					if (!dialog.isBusy && !dialog.matchAfter) {
						ai();
					}
				};

				while (!dialog.matchAfter) {
					await game.pause();
				}
				function ai() {
					setTimeout(function () {
						const cards = Array.from(dialog.contentContainer.childNodes)
							.filter((i) => get.itemtype(i) == 'card')
							.filter((i) => !dialog.matched.includes(i))
							.sort((a, b) => b.y - a.y);
						let swaped = false;
						for (const card1 of cards) {
							const card2 = cards.find((i) => checkSwap(card1, i));
							if (card2) {
								swapCard(card1, card2);
								swaped = true;
								break;
							}
						}
						if (swaped) {
							return;
						}
						cards.sort(() => 0.5 - Math.random());
						for (const card1 of cards) {
							const card2 = cards.find((i) => isAdj(card1, i));
							if (card2) {
								swapCard(card1, card2);
								break;
							}
						}
					}, 300);
				}
				dialog.close();
				const gain = get.links(dialog.matched);
				const buttons = Array.from(dialog.contentContainer.childNodes)
					.filter((i) => get.itemtype(i) == 'card')
					.filter((i) => !dialog.matched.includes(i));
				for (const { x, y, link } of buttons) {
					storage[x][y] = link;
				}

				const addToExpansions = get.links(buttons).filter((i) => !player.getExpansions(event.name).includes(i));

				await player.gain(gain, 'gain2');
				const next = player.addToExpansion(addToExpansions, player);
				next.gaintag.add(event.name);
				await next;
			}
		},
		onremove(player, skill) {
			const cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
			delete player.storage[skill];
		},
		ai: {
			order: 11,
			result: {
				player: 3,
			},
		},
		intro: {
			mark(dialog, storage, player) {
				dialog.content.style['overflow-x'] = 'visible';
				if (!storage || !storage.length) {
					return '(棋盘空空如也)';
				}
			},
		},
		subSkill: {
			tip: {},
		},
	},

	yb019_lincu: {
		init(player, skill) {
			player.addSkillBlocker(skill);
		},
		onremove(player, skill) {
			player.removeSkillBlocker(skill);
		},
		charlotte: true,
		skillBlocker(skill, player) {
			return !lib.skill[skill].charlotte && !get.is.locked(skill, player);
		},
		group: 'yb019_lincu_jia',
		mark: true,
		intro: {
			content(storage, player, skill) {
				let list = player.getSkills(null, false, false).filter(function (i) {
					return lib.skill.fengyin.skillBlocker(i, player);
				});
				if (list.length) {
					return '失效技能:' + get.translation(list);
				}
				return '无失效技能';
			},
		},
		subSkill: {
			jia: {
				trigger: {
					player: 'damageBegin3',
				},
				forced: true,
				content() {
					trigger.num++;
				},
			},
		},
	},
	yb019_chicu: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: 'loseAfter',
		},
		filter(event, player, card) {
			if (event.type != 'discard' || _status.currentPhase != player || event.player == player) {
				return false;
			}
			for (let i = 0; i < event.cards2.length; i++) {
				if (get.name(event.cards2[i], null, event.hs.includes(event.cards2[i]) ? event.player : false) == 'ybsl_cu') {
					return true;
				}
			}
			return false;
		},
		content() {
			let target = trigger.player;
			target.addTempSkill('yb019_lincu');
		},
	},
	yb019_renxing: {
		shaRelated: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCardToTargeted',
		},
		filter(event, player) {
			if (event.target.countCards('h') == 0) {
				return false;
			}
			return (event.card.name == 'sha' || (get.type2(event.card, false) == 'trick' && get.tag(event.card, 'damage') > 0)) && !event.target.hasSkill('yb019_renxingbiaoji');
		},

		logTarget: 'target',
		content() {
			'step 0';
			let target = trigger.target;
			event.target = target;

			event.videoId = lib.status.videoId++;
			let cards = target.getCards('h');
			if (player.isOnline2()) {
				player.send(
					function (cards, id) {
						ui.create.dialog('任性', cards).videoId = id;
					},
					cards,
					event.videoId,
				);
			}
			event.dialog = ui.create.dialog('任性', cards);
			event.dialog.videoId = event.videoId;
			if (!event.isMine()) {
				event.dialog.style.display = 'none';
			}
			player
				.chooseButton()
				.set('filterButton', function (button) {
					return get.type(button.link) == 'basic';
				})
				.set('dialog', event.videoId);
			('step 1');
			if (result.bool) {
				event.card = result.links[0];
				const func = function (card, id) {
					const dialog = get.idDialog(id);
					if (dialog) {
						for (let i = 0; i < dialog.buttons.length; i++) {
							if (dialog.buttons[i].link == card) {
								dialog.buttons[i].classList.add('selectedx');
							} else {
								dialog.buttons[i].classList.add('unselectable');
							}
						}
					}
				};
				if (player.isOnline2()) {
					player.send(func, event.card, event.videoId);
				} else if (event.isMine()) {
					func(event.card, event.videoId);
				}
				player.chooseControl(['弃置', '重选', 'cancel2']);
			} else {
				if (player.isOnline2()) {
					player.send('closeDialog', event.videoId);
				}
				event.dialog.close();
				event.finish();
				target.addTempSkill('yb019_renxingbiaoji');
			}
			('step 2');
			if (player.isOnline2()) {
				player.send('closeDialog', event.videoId);
				event.dialog.close();
				let card = event.card;
				target.discard(card);
				target.addTempSkill('yb019_renxingbiaoji');
			} else if (result.control == '弃置') {
				event.dialog.close();
				let card = event.card;
				target.discard(card);
				target.addTempSkill('yb019_renxingbiaoji');
			} else if (result.control == '重选') {
				event.dialog.close();
				event.goto(0);
			} else {
				target.addTempSkill('yb019_renxingbiaoji');
			}
		},
		ai: {
			threaten: 1.5,
			result: {
				target(player, target) {
					return -target.countCards('h');
				},
			},
			expose: 0.4,
		},
		subSkill: {
			biaoji: {
				charlotte: true,
				forced: true,
			},
		},
	},
	yb019_renxingbiaoji: {
		mark: true,
		marktext: '任性',
		intro: {
			content: '已被任性过',
		},
		charlotte: true,
		forced: true,
	},
	yb019_misan: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCardAfter',
		},
		forced: true,
		filter(event, player) {
			if (
				player.getHistory('custom', function (evt) {
					return evt.yb019_misan_name == event.card.name;
				}).length
			) {
				return false;
			}
			if (get.type(event.card) != 'basic') {
				return false;
			}
			return event.cards && event.cards.filterInD().length;
		},
		content() {
			'step 0';
			player
				.chooseTarget(get.prompt('yb019_misan'), '将' + get.translation(trigger.cards) + '交给一名其他角色', function (card, player, target) {
					return target != player;
				})
				.set('ai', function (target) {
					if (target.hasJudge('lebu')) {
						return 0;
					}
					let att = get.attitude(_status.event.player, target);
					if (att < 3) {
						return 0;
					}
					if (target.hasSkillTag('nogain')) {
						att /= 10;
					}
					if (target.hasSha() && _status.event.sha) {
						att /= 5;
					}
					return att / (1 + get.distance(player, target, 'absolute'));
				})
				.set('sha', trigger.cards[0].name == 'sha');
			('step 1');
			if (result.bool) {
				result.targets[0].gain(trigger.cards.filterInD(), 'gain2');
				player.getHistory('custom').push({ yb019_misan_name: trigger.card.name });
			}
		},
	},
	yb019_cutan: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['phaseZhunbeiBegin', 'damageEnd'],
		},
		forced: true,
		content() {
			player.gain(game.YB_createCard('ybsl_cu', null, null, null), 'gain2');
		},
		derivation: ['ybsl_cu'],
		init(player, skill) {
			game.broadcastAll(function () {
				lib.inpile.add('ybsl_cu');
			});
		},
	},

	ybsl_cu_discard: {
		trigger: {
			player: 'loseAfter',
		},
		cardSkill: true,

		getIndex(event, player, name) {
			if (event.type != 'discard') {
				return false;
			}
			let evt = event.getl(player);
			if (
				!evt ||
				!evt.hs ||
				!evt.hs.filter(function (i) {
					return i.name == 'ybsl_cu';
				}).length
			) {
				return false;
			}

			let num = evt.hs.filter(function (i) {
				return i.name == 'ybsl_cu';
			}).length;
			if (num > 0) {
				game.log(player, '触发了', '#g【醋】', '的效果');
				return num;
			}
		},
		whiteListFilter: [],
		forced: true,
		popup: false,
		content() {
			player.chooseToDiscard(true).type = 'ybsl_cu';
		},
	},
	yb019_zhiyu: {
		audio: 'yb019_renxing',
		enable: 'phaseUse',
		selectCard: 1,
		filterCard(card, player) {
			player = _status.event.player;
			return !player.storage.yb019_zhiyu_ban || !player.storage.yb019_zhiyu_ban.includes(card.name);
		},
		filter(event, player) {
			return true;
		},
		filterTarget(card, player, target) {
			return player != target;
		},
		discard: false,
		lose: false,
		selectTarget: 1,
		content: async function (event, trigger, player) {
			await player.addTempSkill('yb019_zhiyu_ban');
			if (!player.storage.yb019_zhiyu_ban) {
				player.storage.yb019_zhiyu_ban = [];
			}
			await player.storage.yb019_zhiyu_ban.push(event.cards[0].name);
			await player.showCards(event.cards);
			await player.give(event.cards[0], event.target, true);

			await player.useCard(
				{
					name: event.cards[0].name,
					nature: event.cards[0].nature,
				},
				event.target,
				false,
			);
		},
		check(card) {
			if (card.name == 'ybsl_cu') {
				return 2;
			} else if (card.name == 'du') {
				return 2;
			} else {
				return 1;
			}
		},
		ai: {
			order: 11,
			result: {
				target(player, target) {
					if (!ui.selected.cards.length) {
						return 0;
					}
					let card = ui.selected.cards[0];
					if (card.name == 'ybsl_cu') {
						return target.countCards('h') - 10;
					} else if (card.name == 'du') {
						return -10;
					} else if (
						player.canUse(
							{
								name: card.name,
								nature: card.nature,
							},
							target,
							false,
						)
					) {
						return (
							get.effect(
								target,
								{
									name: card.name,
									nature: card.nature,
								},
								player,
								target,
							) +
							get.value({
								name: card.name,
								nature: card.nature,
							})
						);
					} else {
						return 1;
					}
				},
			},
		},
		subSkill: {
			ban: {
				intro: {
					content: 'expansion',
				},
				charlotte: true,
			},
		},
	},

	yb020_shange: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		filter(event, player) {
			return player.countCards('he', function (card) {
				return !player.storage.yb020_shange_mark || !player.storage.yb020_shange_mark.includes(get.color(card));
			});
		},
		position: 'he',
		selectCard: [1, 5],
		complexCard: true,
		filterCard(card, player) {
			if (ui.selected.cards.length == 0) {
				return !player.storage.yb020_shange_mark || !player.storage.yb020_shange_mark.includes(get.color(card));
			}
			return get.color(card) == get.color(ui.selected.cards[0]);
		},
		check(card) {
			return 6 - get.value(card);
		},
		content() {
			'step 0';
			player.YB_tempz('yb020_shange_mark', get.color(event.cards[0]));
			('step 1');
			let num = event.cards.length;
			event.cardsx = get.cards(num * 2);
			game.cardsGotoOrdering(event.cardsx);
			player.showCards(event.cardsx);
			('step 2');
			event.cardsy = event.cardsx.filter((card) => get.color(card) != get.color(event.cards[0]) && get.position(card, 'o'));
			player.gain(event.cardsy, 'gain2');
			('step 3');
			if (event.cardsy.length < event.cards.length) {
				player.recover();
			}
		},
	},
	yb020_wanyue: {
		inherit: 'yb001_wanyue',
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb020_yuyun: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb020_zhishi: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb020_zhuangrong: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: 'phaseBefore',
			player: 'enterGame',
		},
		filter(event, player) {
			return event.name != 'phase' || game.phaseNumber == 0;
		},
		content() {
			'step 0';
			let i = 0;
			let list = [];
			while (i++ < 2) {
				let card = get.cardPile(function (card) {
					if (get.type(card) != 'equip') {
						return false;
					}
					return list.length == 0 || get.subtype(card) != get.subtype(list[0]);
				});
				if (card) {
					list.push(card);
				}
			}
			if (!list.length) {
				event.finish();
				return;
			}
			event.list = list;
			player.gain(event.list, 'gain2');
			('step 1');
			let card = event.list.shift();
			if (player.getCards('h').includes(card)) {
				player.$give(card, player, false);
				player.equip(card);
			}
			if (event.list.length) {
				event.redo();
			}
		},
		group: 'yb020_zhuangrong_damage',
		subSkill: {
			used: {
				init(player) {
					if (!player.storage.yb020_zhuangrong_used1) {
						player.storage.yb020_zhuangrong_used1 = 0;
					}
					if (!player.storage.yb020_zhuangrong_used2) {
						player.storage.yb020_zhuangrong_used2 = 0;
					}
				},
				onremove(player, skill) {
					delete player.storage.yb020_zhuangrong_used1;
					delete player.storage.yb020_zhuangrong_used2;
				},
			},
			damage: {
				audio: 'yb020_zhuangrong',
				trigger: {
					source: 'damageAfter',
					player: 'damageAfter',
				},

				YB_usable(player, i) {
					let num1 = player.storage.yb020_zhuangrong_used1 || 0,
						num2 = player.storage.yb020_zhuangrong_used2 || 0;
					const eqs1 = player.getCards('e').filter((card) => get.color(card) == 'black').length,
						eqs2 = player.getCards('e').filter((card) => get.color(card) == 'red').length;
					if (i) {
						return [num1, eqs1, num2, eqs2];
					}
					return [eqs1 - num1, eqs2 - num2];
				},
				init(player) {
					player.markSkill('yb020_zhuangrong_damage');
				},
				mark: true,
				intro: {
					content(storage, player) {
						let list = lib.skill.yb020_zhuangrong_damage.YB_usable(player, true);
						return `<span class=thundertext>${list[0]}/${list[1]}</span>、<span class=firetext>${list[2]}/${list[3]}</span>`;
					},
				},
				filter(event, player) {
					let list = lib.skill.yb020_zhuangrong_damage.YB_usable(player);
					return list[0] > 0 || (list[1] > 0 && player.isDamaged());
				},
				async cost(event, trigger, player) {
					event.result = { bool: true, cost_data: { index: 0 } };
					let list = lib.skill.yb020_zhuangrong_damage.YB_usable(player);
					let list2 = lib.skill.yb020_zhuangrong_damage.YB_usable(player, true);
					if (list[0] > 0 && list[1] > 0 && player.isDamaged()) {
						const { index } = await player
							.chooseControl()
							.set('prompt', '妆容:请选择一项')
							.set('choiceList', ['黑:摸两张牌' + list2[0] + '/' + list2[1], '红:回复1点体力' + list2[2] + '/' + list2[3]])
							.set('ai', function () {
								return 1;
							})
							.forResult();
						event.result = { bool: true, cost_data: { index: index } };
					} else if (list[1] > 0 && player.isDamaged()) {
						event.result = { bool: true, cost_data: { index: 1 } };
					}
				},
				async content(event, trigger, player) {
					const result = event.cost_data;
					player.addTempSkill('yb020_zhuangrong_used');
					if (result.index == 0) {
						if (!player.storage.yb020_zhuangrong_used1) {
							player.storage.yb020_zhuangrong_used1 = 0;
						}
						player.storage.yb020_zhuangrong_used1++;
						player.draw(2);
					} else {
						if (!player.storage.yb020_zhuangrong_used2) {
							player.storage.yb020_zhuangrong_used2 = 0;
						}
						player.storage.yb020_zhuangrong_used2++;
						player.recover();
					}
				},
			},
		},
	},
	yb020_zhuangrongx: {
		audio: 'yb020_zhuangrong',
		trigger: {
			player: ['useCard', 'respond'],
		},
		filter(event, player) {
			return get.color(event.card) == 'red';
		},
		cost() {
			event.result = player
				.chooseTarget(get.prompt2('yb020_zhuangrongx'), function (card, player, target) {
					return target.isDamaged();
				})
				.set('ai', function (target) {
					return get.attitude(_status.event.player, target) > 5;
				})
				.forResult();
		},
		content() {
			targets[0].recover();
		},
		ai: {
			expose: 0.3,
		},
	},

	yb021_shusuan: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',
		init(player) {
			if (!player.storage.yb021_shusuan) {
				player.storage.yb021_shusuan = 4;
			}
		},

		content() {
			'step 0';

			event.num = player.storage.yb021_qiujiao || 0;
			event.str = '牌堆顶';
			event.cards = get.cards(event.num);
			event.str2 = '手牌';
			event.cards2 = player.getCards('h');
			game.cardsGotoOrdering(event.cards);
			('step 1');
			player.storage.yb021_qiujiao = 0;
			const dialog = ui.create.dialog('请选择共计四张牌进行24点计算(即使出现无限小数也不要紧,一样可以计算)');
			dialog.add('牌堆顶');
			dialog.add(event.cards);
			dialog.add('手牌');
			dialog.add(event.cards2);
			player.chooseButton(dialog, 4, true);
			('step 2');
			event.list66 = result.links;

			let list = [];
			if (Array.isArray(event.cards)) {
				for (const i of event.cards) {
					if (!event.list66.includes(i)) {
						list.push(i);
					}
				}
			}
			game.log('!', list);
			list.reverse();
			for (let i = 0; i < list.length; i++) {
				ui.cardPile.insertBefore(list[i], ui.cardPile.firstChild);
			}
			player.showCards(event.list66);
			player.FY_24(event.list66, '数算');
			('step 3');
			if (result.FY_24 == 'victoey') {
				player.draw(event.num);
			}
			player.$throw(event.list66);
			player
				.chooseControl('交出', '弃置')
				.set('ai', function (control) {
					if (
						game.hasPlayer(function (current) {
							return current != player && get.attitude(player, current) > 2;
						})
					) {
						return 0;
					}
					return 1;
				})
				.set('prompt', '将用于计算的牌交给一名其他角色还是弃置？');
			('step 4');
			if (result.index == 0) {
				player
					.chooseTarget(function (card, player, target) {
						return target != player;
					})
					.set('ai', function (current) {
						return current != player && get.attitude(player, current) > 2;
					});
			} else {
				player.discard(event.list66, true);
				event.finish();
			}
			('step 5');
			if (result.bool) {
				let target = result.targets[0];
				player.line(target, 'water');
				target.gain(event.list66, 'gain2');
			}
		},
		ai: {
			order: 11,
			result: {
				player: 1,
			},
			threaten: 1.5,
		},
	},
	yb021_qiujiao: {
		audio: 'ext:夜白神略/audio/character:2',

		audioname2: {
			ybsl_087tianlu: 'yb087_qiujiao',
		},
		group: 'yb021_qiujiao_use',
		subSkill: {
			use: {
				enable: 'phaseUse',
				usable: 1,
				audio: 'yb021_qiujiao',
				selectTarget: 1,
				filterTarget(card, player, target) {
					return target != player && target.countCards('he') > 0;
				},
				content() {
					const next = game.createEvent('yb021_qiujiao', false);
					next.player = player;
					next.target = event.targets[0];
					next.setContent(lib.skill.yb021_qiujiao.sword);
				},
				ai: {
					rusult: {
						player: 1.1,
						target(target) {
							return -1;
						},
					},
				},
			},
		},
		trigger: { player: 'damageEnd' },
		cost() {
			let list = game.filterPlayer(function (current) {
				return current != player && current.countCards('he') > 0;
			});
			event.result = player
				.chooseTarget(1, function (card, player, target) {
					return list.includes(target);
				})
				.set('prompt', '请选择一名其他角色,令其交给你一张牌')
				.set('ai', function (target) {
					return get.attitude(player, target);
				})
				.forResult();
		},
		content() {
			const next = game.createEvent('yb021_qiujiao', false);
			next.player = player;
			next.target = event.targets[0];
			next.setContent(lib.skill.yb021_qiujiao.sword);
		},
		sword() {
			'step 0';
			target.chooseToGive('he', true, player, '求教:将一张牌交给' + get.translation(player) + '');
			('step 1');
			if (!player.storage.yb021_qiujiao) {
				player.storage.yb021_qiujiao = 0;
			}
			player.storage.yb021_qiujiao++;

			player.markSkill('yb021_qiujiao');
		},
		mark: true,
		marktext: '知',
		intro: {
			markcount(storage, player) {
				return storage || 0;
			},
			name: '知识点',
		},
		init(player) {
			player.storage.yb021_qiujiao = 0;
		},
	},

	yb022_yiduan: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterTarget(card, player, target) {
			return player != target && target.countCards('h') > 0;
		},
		content() {
			'step 0';
			event.type = [];
			event.list = {};
			const listk = [];
			const listn = [];
			for (const i of lib.inpile) {
				if (event[get.type2(i)] != true) {
					event.type.add(get.translation(get.type2(i)));
					let n = get.type2(i);
					event.list[n] = get.type2(i);
					listn.add(n);
					listk.add([n, get.translation(get.type2(i))]);
					event[n] = true;
				}
			}
			event.listk = listk;
			event.listn = listn;

			event.videoId = lib.status.videoId++;
			if (event.isMine()) {
				event.dialog = ui.create.dialog('<font size=6><b>臆断</b></font><br>选择若干个类型,令其交给你一张符合其中一种类型的手牌,若不执行则受到等量伤害', [listk, 'tdnodes']);
				event.dialog.videoId = event.videoId;
			} else if (player.isOnline2()) {
				player.send(
					function (listk, id) {
						const dialog = ui.create.dialog('<font size=6><b>臆断</b></font><br>选择若干个类型,令其交给你一张符合其中一种类型的手牌,若不执行则受到等量伤害', [listk, 'tdnodes']);
						dialog.videoId = id;
					},
					listk,
					event.videoId,
				);
			}

			('step 1');
			const chooseButton = player.chooseButton([1, Infinity], true);
			chooseButton.set('dialog', event.videoId);
			chooseButton.set('ai', function (button) {
				if (button.link == 'trick') {
					return true;
				}
				return false;
			});
			chooseButton.set('filterButton', function (button) {
				const listn = _status.event.parent.listn;
				for (let i = 0; i < ui.selected.buttons.length; i++) {
					if (!listn.includes(ui.selected.buttons[i].link) || !listn.includes(button.link)) {
						return false;
					}
				}
				return true;
			});
			('step 2');
			game.broadcastAll('closeDialog', event.videoId);
			if (result.links) {
				event.lists = result.links;
				game.log(player, '选择了', event.lists);
				event.types = get.YB_map(event.lists, event.list);
				target
					.chooseCard('h', function (card) {
						if (!_status.event.parent.types.includes(get.type(card))) {
							return false;
						}
						return true;
					})
					.set('ai', function (card) {
						return true;
					});
			} else {
				event.finish();
			}
			('step 3');
			if (result.cards) {
				target.give(result.cards, player);
			} else {
				target.damage(event.types.length, player);
			}
		},
		ai: {
			order: 5,
			result: {
				player: 1,
				target: -1,
			},
			threaten: 1.5,
		},
	},
	yb022_duanxiang: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		trigger: { global: 'damageEnd' },
		check(event, player) {
			let att = get.attitude(_status.event.player, event.player);
			if (att < 0) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			let num = trigger.num;
			if (trigger.player.countCards('he') >= num * 2) {
				trigger.player
					.discardPlayerCard('he', trigger.player, num * 2)
					.set('prompt', '断想')
					.set('prompt2', '请选择' + get.cnNumber(num * 2) + '张牌弃置,然后回复' + get.cnNumber(num) + '点体力,<br>否则减少' + get.cnNumber(num) + '点体力上限并摸等量牌')
					.set('ai', function (button) {
						return 100 - get.value(button.link);
					});
			}
			('step 1');
			if (result.bool) {
				trigger.player.recover(trigger.num);
			} else {
				trigger.player.loseMaxHp(trigger.num);
				trigger.player.draw(trigger.num);
			}
		},
	},
	yb022_duanxiangxin: {
		audio: 'yb022_duanxiang',

		trigger: { global: 'damageEnd' },
		filter(event, player) {
			if (!event.source || !event.source.isAlive() || !event.player.isAlive()) {
				return false;
			}
			let source = event.source,
				target = event.player;
			const num1 = source.countCards('h') - target.hp;
			let num2 = target.countCards('h') - source.hp;
			if (num1 != 0 || num2 != 0) {
				return true;
			}
			return false;
		},
		usable: 1,
		cost() {
			'step 0';
			event.result = { bool: false, cost_data: null };
			let list = [];
			const trigger = _status.event.getTrigger();
			let source = trigger.source,
				target = trigger.player;
			const num1 = source.countCards('h') - target.hp;
			let num2 = target.countCards('h') - source.hp;
			if (num1 < 0) {
				list.push([1, '令' + get.translation(source) + '将手牌摸' + -num1 + '张']);
			}
			if (num1 > 0) {
				list.push([2, '令' + get.translation(source) + '将手牌弃' + num1 + '张']);
			}
			if (num2 < 0) {
				list.push([3, '令' + get.translation(target) + '将手牌摸' + -num2 + '张']);
			}
			if (num2 > 0) {
				list.push([4, '令' + get.translation(target) + '将手牌弃' + num2 + '张']);
			}
			event.videoId = lib.status.videoId++;
			if (event.isMine()) {
				event.dialog = ui.create.dialog('<font size=6><b>断想</b></font><br>是否选择一项', [list, 'tdnodes']);
				event.dialog.videoId = event.videoId;
			} else if (player.isOnline2()) {
				player.send(
					function (list, id) {
						const dialog = ui.create.dialog('<font size=6><b>断想</b></font><br>是否选择一项', [list, 'tdnodes']);
						event.dialog.videoId = id;
					},
					list,
					event.videoId,
				);
			}
			('step 1');
			player
				.chooseButton(1)
				.set('dialog', event.videoId)
				.set('ai', function (button) {
					const trigger = _status.event.getTrigger();
					const player = _status.event.player;
					let source = trigger.source,
						target = trigger.player;
					const att1 = get.attitude(player, trigger.source),
						att2 = get.attitude(player, trigger.target);
					const num1 = source.countCards('h') - target.hp;
					let num2 = target.countCards('h') - source.hp;
					if (att1 > 0 && num1 < 0) {
						if (button.link == 1) {
							return true;
						}
					}
					if (att1 < 0 && num1 > 0) {
						if (button.link == 2) {
							return true;
						}
					}
					if (att2 > 0 && num2 < 0) {
						if (button.link == 3) {
							return true;
						}
					}
					if (att2 < 0 && num2 > 0) {
						if (button.link == 4) {
							return true;
						}
					}
					return false;
				})
				.set('filterButton', function (button) {
					return true;
				})
				.forResult();
			('step 2');
			game.broadcastAll('closeDialog', event.videoId);
			if (result.links) {
				event.result = { bool: true, cost_data: result.links[0] };
			}
		},
		content() {
			const trigger = trigger || _status.event.getTrigger();
			let source = trigger.source,
				target = trigger.player;
			const num1 = source.countCards('h') - target.hp;
			let num2 = target.countCards('h') - source.hp;
			switch (event.cost_data) {
				case 1:
					source.draw(-num1);
					break;
				case 2:
					source.discardPlayerCard('h', source, num1, true);
					break;
				case 3:
					target.draw(-num2);
					break;
				case 4:
					target.discardPlayerCard('h', target, num2, true);
					break;
			}
		},
	},

	yb023_jiang: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb023_fenghou: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'damageEnd',
			source: 'damageSource',
		},
		filter(event, player) {
			return event.player.countCards('h') > 0;
		},
		async content(event, trigger, player) {
			let target = trigger.player;
			const result = await player
				.choosePlayerCard('展示' + get.translation(target) + '的一张手牌,若为红色,这张牌视为血杀,否则弃置之,你摸两张牌', target, true, 'h')
				.set('ai', function (button) {
					const trigger = _status.event.getTrigger();
					let att = get.attitude(_status.event.player, trigger.player);
					if (att > 0) {
						return -get.value(button.link);
					}
					return get.value(button.link) && !button.link.hasGaintag('yb023_fenghou');
				})
				.forResult();
			if (result.bool) {
				await target.showCards(result.cards);
				if (get.color(result.cards[0]) == 'red') {
					target.addSkill('yb023_fenghou_viewas');
					target.addGaintag(result.cards, 'yb023_fenghou');
				} else {
					await target.modedDiscard(result.cards).set('discarder', player);
					await player.draw(2);
				}
			}
		},
		subSkill: {
			viewas: {
				mod: {
					cardname(card) {
						if (get.itemtype(card) == 'card' && card.hasGaintag('yb023_fenghou')) {
							return 'sha';
						}
					},
					cardnature(card) {
						if (get.itemtype(card) == 'card' && card.hasGaintag('yb023_fenghou')) {
							return 'YB_blood';
						}
					},
				},
				charlotte: true,
			},
		},
	},

	ybsl_tang_used: {
		trigger: {
			player: 'useCard1',
		},

		cardSkill: true,
		filter(event, player) {
			let cards = event.cards;
			if (!cards.length) {
				return false;
			}
			for (const i of cards) {
				if (i.name != 'ybsl_tang') {
					return false;
				}
			}
			return player.countCards('h') > 0;
		},
		forced: true,
		popup: false,
		content() {
			'step 0';
			player.chooseCard('h', true).set('prompt2', '请选择一张手牌加入此牌实体牌');
			('step 1');
			if (result.cards) {
				game.log(player, '将', '#y' + get.translation(result.cards[0]), '加入了', '#y' + get.translation(trigger.card), '的实体牌中');
				player.lose(result.cards[0], 'visible');
				trigger.cards.push(result.cards[0]);
			} else {
				event.goto(4);
			}
			('step 2');
			let cards = trigger.cards;
			for (const i of cards) {
				if (i.name != 'ybsl_tang') {
					event.goto(4);
				}
			}
			('step 3');
			event.goto(0);
			('step 4');
			let cards1 = trigger.cards;
			let num = cards1.filter(function (i) {
				return i.name == 'ybsl_tang';
			}).length;
			trigger.baseDamage = num;
		},
	},

	yb025_shiyuan: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		mod: {
			aiOrder(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== 'card' || get.type(card) !== 'equip') {
					return num;
				}
				const eq = player.getEquip(get.subtype(card));
				if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) {
					return 0;
				}
			},
		},
		position: 'he',
		filterCard: true,
		selectCard: [1, Infinity],
		prompt: '弃置任意张牌并摸等量的牌',
		check(card) {
			return 6 - get.value(card);
		},
		content: async function (event, trigger, player) {
			let num = event.cards.length;
			await player.draw(num);
			if (player.hp >= num) {
				const result = await player
					.chooseBool()
					.set('ai', function () {
						if (player.hp - num > 1) {
							return true;
						} else {
							return false;
						}
					})
					.set('prompt', '是否失去' + num + '点体力,然后再摸' + num + '张牌')
					.forResult();
				if (result.bool == true) {
					await player.loseHp(num);
					await player.draw(num);
				}
			}
		},
		ai: {
			order: 1,
			result: {
				player: 1,
			},
			threaten: 1.5,
		},
	},

	yb025_tuiqiao: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		filter(event, player) {
			return player.maxHp - player.hp >= 3;
		},
		content: async function (event, trigger, player) {
			await player.loseMaxHp(3);
			await player.draw(3);
		},
	},
	yb025_chengyin: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'loseMaxHpAfter',
		},
		filter(event, player) {
			if (
				game.countPlayer(function (current) {
					return current != player;
				}) >= 1
			) {
				return true;
			}
		},

		cost() {
			let list = game.filterPlayer(function (current) {
				return current != player;
			});
			event.result = player
				.chooseTarget(1, function (card, player, target) {
					return list.includes(target);
				})
				.set('prompt', '请选择一名其他角色,令其获得' + trigger.num + '点护甲')
				.set('ai', function (target) {
					return get.attitude(player, target);
				})
				.forResult();
		},

		content: async function (event, trigger, player) {
			let target = event.targets[0];
			await target.changeHujia(trigger.num);
		},
	},

	yb025_chengyinx: {
		audio: 'yb025_chengyin',
		trigger: {
			target: 'useCardToTargeted',
		},
		filter(event, player) {
			if (event.player == player) {
				return false;
			}

			if (event.targets.length <= 1) {
				return false;
			}
			return true;
		},
		forced: true,
		content() {
			'step 0';
			const targets = trigger.targets;
			let num = 0;
			for (const i of targets) {
				if (i.hp <= player.hp && i != player) {
					trigger.parent.excluded.add(i);
					num++;
				}
			}
			event.num = num;
			('step 1');
			let list = [];
			for (let i = 0; i < event.num; i++) {
				list.push(player);
			}
			trigger.parent.targets = trigger.parent.targets.concat(list);
			trigger.parent.triggeredTargets4 = trigger.parent.triggeredTargets4.concat(list);
		},
	},

	yb025_choujiang: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		selectCard: 1,
		filterCard(card, player) {
			return card.number;
		},
		check(card) {
			return 6 - get.value(card);
		},
		position: 'he',
		content() {
			'step 0';
			event.num = event.cards[0].number - 1;
			event.cards = get.cards(13);
			game.cardsGotoOrdering(event.cards);
			('step 1');
			ui.clear();
			event.cardlist = [];

			const dialog = ui.create.dialog('抽奖', cards, true);
			_status.dieClose.push(dialog);
			dialog.videoId = lib.status.videoId++;
			game.addVideo('cardDialog', null, ['抽奖', get.cardsInfo(cards), dialog.videoId]);
			event.parent.preResult = dialog.videoId;
			event.dialog = dialog;

			('step 2');
			let numb = 0;
			while (numb < 13) {
				numb++;
				const cardx = event.cards[event.num];
				if (event.cardlist.includes(cardx)) {
					break;
				} else {
					event.cardlist.push(cardx);

					event.num = cardx.number - 1;
				}
			}
			('step 3');

			('step 4');
			player.chooseTarget(`请选择将${get.YB_tobo(event.cardlist)}交给一名角色`).set('ai', function (target) {
				const atk = get.attitude(player, target);
				return atk;
			});
			('step 5');
			if (result.targets) {
				const cardlist = event.cardlist;
				const cardlist2 = event.cards.filter(function (cardf) {
					return !cardlist.includes(cardf);
				});
				player.discard(cardlist2);
				result.targets[0].gain(cardlist, 'gain2');
			}
			('step 6');
			event.dialog.close();
			_status.dieClose.remove(event.dialog);
			game.addVideo('cardDialog', null, event.preResult);
		},
	},
	yb025_haodu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		selectCard: [1, 13],
		complexCard: true,
		filterCard(card, player) {
			const number = card.number;
			if (Array.isArray(ui.selected.cards)) {
				for (const i of ui.selected.cards) {
					if (i.number == number) {
						return false;
					}
				}
			}
			return card.number;
		},
		check(card) {
			return 6 - get.value(card);
		},
		position: 'h',
		content: async function (event, trigger, player) {
			const lista = [];
			for (const i of event.cards) {
				lista.push(i.number);
			}

			const cardsx = get.cards(13);
			await game.cardsGotoOrdering(cardsx);
			ui.clear();

			const cardlist = [];
			for (const z of lista) {
				cardlist.push(cardsx[z - 1]);
			}
			const dialog = ui.create.dialog('豪赌', cardsx, true);

			_status.dieClose.push(dialog);
			dialog.videoId = lib.status.videoId++;
			game.addVideo('cardDialog', null, ['豪赌^', get.cardsInfo(cardsx), dialog.videoId]);
			event.parent.preResult = dialog.videoId;

			await game.delay(3);
			await player.gain(cardlist, 'gain2');
			dialog.close();
			_status.dieClose.remove(dialog);
			game.addVideo('cardDialog', null, event.preResult);
		},
	},
	yb025_zanzhu: {
		audio: 'ext:夜白神略/audio/character:2',
		group: 'yb025_zanzhu_use',
		subSkill: {
			use: {
				enable: 'phaseUse',
				usable: 1,
				audio: 'yb025_zanzhu',
				selectTarget: 1,
				filterTarget(card, player, target) {
					return target != player && target.countCards('he') > 0;
				},
				content() {
					const next = game.createEvent('yb025_zanzhu', false);
					next.player = player;
					next.target = event.targets[0];
					next.setContent(lib.skill.yb025_zanzhu.sword);
				},
				ai: {
					rusult: {
						player: 1.1,
						target(target) {
							return target.countCards('he') - 2.5;
						},
					},
				},
			},
		},
		trigger: { player: 'damageEnd' },
		cost() {
			let list = game.filterPlayer(function (current) {
				return current != player && current.countCards('he') > 0;
			});
			event.result = player
				.chooseTarget(1, function (card, player, target) {
					return list.includes(target);
				})
				.set('prompt', '请选择一名其他角色,令其交给你一张牌,然后其摸一张牌')
				.set('ai', function (target) {
					if (get.attitude(player, target) < 0) {
						return get.attitude(player, target) * (target.countCards('he') - 2.5);
					} else {
						return get.attitude(player, target) * target.countCards('he');
					}
				})
				.forResult();
		},
		content() {
			const next = game.createEvent('yb025_zanzhu', false);
			next.player = player;
			next.target = event.targets[0];
			next.setContent(lib.skill.yb025_zanzhu.sword);
		},
		sword() {
			'step 0';
			target.chooseToGive('he', true, player, '赞助:将一张牌交给' + get.translation(player) + '然后你摸一张牌');
			('step 1');
			if (result.cards) {
				target.draw();
			}
		},
	},

	ybsl_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		groupSkill: 'YB_dream',
		forced: true,
		filter(event, player) {
			return player.group == 'YB_dream';
		},
		audioname: ['ybsl_014liutianyu', 'ybsl_026can', 'ybsl_027rain', 'ybsp_027rain', 'ybsl_029dawn', 'ybsl_018huanqing', 'ybsl_034zhoulianyuan', 'ybnb_034zhoulianyuan', 'ybsl_036bright', 'ybsl_037diamondqueen', 'ybsl_038tengwu', 'db_ybsp_038tengwu', 'ybsl_039zhafu', 'db_ybsl_067snake', 'ybsl_069xiangzi', 'ybsl_076zhujun', 'ybsl_077yangqixu', 'ybsb_077yangqixu', 'ybsl_078zhuyahai', 'ybsl_083xiaozhu', 'ybsl_122wangbingyu'],

		content() {
			'step 0';
			player
				.chooseControl('是', 'cancel2')
				.set('prompt', '是否摸两张牌,令本回合手牌上限-1')
				.set('ai', function () {
					if (player.hasJudge('lubu')) {
						return 'cancel2';
					}
					return '是';
				});
			('step 1');
			if (result.control == 'cancel2') {
				event.finish();
				return;
			}
			player.draw(2);
			player.addTempSkill('ybsl_sanmeng_buff');
		},
		group: 'ybsl_sanmeng_add',
		subSkill: {
			buff: {
				mark: true,
				marktext: '散',
				intro: {
					content: '本回合手牌上限-1',
				},
				mod: {
					maxHandcard(player, num) {
						return num - 1;
					},
				},
			},
			add: {
				audio: 'ybsl_sanmeng',
				filter(event, player) {
					return player.group == 'YB_dream';
				},
				trigger: {
					player: 'phaseDiscardBefore',
				},
				groupSkill: 'YB_dream',
				forced: true,
				content() {
					'step 0';

					player
						.chooseToDiscard(2, 'he')
						.set('prompt', '是否弃置两张牌,令手牌上限+1？')
						.set('ai', function (card) {
							const trigger = _status.event.getTrigger();
							const player = _status.event.player;
							if (trigger.player.countCards('h') - 2 >= trigger.player.getHandcardLimit()) {
								return -get.value(card);
							} else {
								return 6 - get.value(card);
							}
						});

					('step 1');
					if (result.bool) {
						lib.skill.chenliuwushi.change(player, 1);
					}
				},
			},
		},
	},

	yb026_xiaoye: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			target: 'useCardToTargeted',
		},
		filter(event, player) {
			return event.card && event.card.name == 'sha';
		},
		content() {
			'step 0';
			player
				.chooseControl('摸一张牌', '弃一张牌', 'cancel2')
				.set('prompt', get.prompt2('yb026_xiaoye'))
				.set('ai', function () {
					return '摸一张牌';
				});
			('step 1');

			if (result.control != 'cancel2') {
				if (result.control == '摸一张牌') {
					player.draw();
					event.goto(2);
				} else if (result.control == '弃一张牌') {
					player.chooseToDiscard(true, 'he');
					event.goto(3);
				}
			}
			('step 2');
			if (!player.hasSkill('yb026_xiaoye_dr') && player.countCards('h') < trigger.player.countCards('h')) {
				player.addTempSkill('yb026_xiaoye_dr');
				trigger.parent.excluded.add(player);
				event.finish();
			} else {
				event.finish();
			}
			('step 3');
			if (!player.hasSkill('yb026_xiaoye_di') && player.countCards('h') < trigger.player.countCards('h')) {
				player.addTempSkill('yb026_xiaoye_di');
				trigger.parent.excluded.add(player);
				event.finish();
			} else {
				event.finish();
			}
		},
		subSkill: {
			dr: {
				mark: true,
				marktext: '摸',
				charlotte: true,
			},
			di: {
				mark: true,
				marktext: '弃',
				charlotte: true,
			},
		},
	},
	yb026_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb027_jisi: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseDrawAfter',
		},

		check(event, player) {
			if (get.attitude(player, event.player) > 0) {
				return false;
			}
			return true;
		},
		filter(event, player) {
			if (event.player == player) {
				return false;
			}
			if (event.player.countCards('h') <= player.countCards('h')) {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			player.gainPlayerCard('he', trigger.player, true);
			('step 1');
			if (trigger.player.countCards('h') > player.countCards('h')) {
				player
					.chooseControl('继续', 'cancel2')
					.set('prompt', '是否继续发动汲丝？')
					.set('prompt2', '获得' + get.translation(trigger.player) + '的一张手牌');
			}

			('step 2');
			if (result.control == '继续') {
				event.goto(0);
			} else {
				event.finish();
			}
		},
	},
	yb027_mili: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			target: 'useCardToTargeted',
		},
		filter(event, player) {
			if (event.player != player) {
				return true;
			}
		},
		content() {
			trigger.player.addMark('yb027_mili_mark');
		},
		forced: true,
		group: ['yb027_mili_mili'],
		subSkill: {
			mark: {
				mark: true,
				marktext: '迷',
				charlotte: true,
				intro: {
					name: '迷离',
					content: 'mark',
				},
			},
			mili: {
				trigger: {
					global: 'phaseAfter',
				},
				forced: true,
				filter(event, player) {
					if (event.player == player) {
						return false;
					}
					if (event.player.countMark('yb027_mili_mark') <= 0) {
						return false;
					}
					return true;
				},
				content() {
					let num = trigger.player.countMark('yb027_mili_mark');
					trigger.player.removeMark('yb027_mili_mark', num);
					player.draw(num);
				},
			},
		},
	},

	yb027_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb028_jianzhen: {
		audio: 'ext:夜白神略/audio/character:2',
		superCharlotte: true,
		charlotte: true,
		group: 'yb028_jianzhen_use',
		subSkill: {
			use: {
				enable: 'phaseUse',
				usable: 1,
				audio: 'yb028_jianzhen',
				superCharlotte: true,
				charlotte: true,
				content() {
					player.draw();
					const next = game.createEvent('yb028_jianzhen', false);
					next.player = player;
					next.setContent(lib.skill.yb028_jianzhen.sword);
				},
			},
		},
		trigger: { player: 'damageEnd' },
		content() {
			player.draw();
			const next = game.createEvent('yb028_jianzhen', false);
			next.player = player;
			next.setContent(lib.skill.yb028_jianzhen.sword);
		},
		sword() {
			'step 0';
			let list = ['jin', 'tu', 'huo', 'shui', 'mu'];
			const list3 = ['金剑元(武器栏)', '土剑元(防具栏)', '火剑元(进攻马)', '水剑元(防御马)', '木剑元(宝物栏)'];
			let list2 = [];
			for (let i = 0; i < list.length; i++) {
				if (!player.hasSkill('yb_jianyuan_' + list[i])) {
					list2.add(['yb_jianyuan_' + list[i], list3[i]]);
				}
			}
			if (list2.length < 1) {
				event.finish();
			} else {
				let cards = player.getCards('h');
				player
					.chooseButton(2, ['剑阵', cards, [list2, 'tdnodes']])
					.set('filterButton', function (button) {
						const type = typeof button.link;
						if (ui.selected.buttons.length && type == typeof ui.selected.buttons[0].link) {
							return false;
						}
						return true;
					})
					.set('ai', function (button) {
						const type = typeof button.link;
						if (type == 'object') {
							return 6 - get.value(button.link);
						}
					});
			}
			('step 1');
			if (result.bool) {
				if (typeof result.links[0] != 'string') {
					result.links.reverse();
				}
				let card = result.links[1],
					choice = result.links[0];
				player.addToExpansion(card, 'gain2').gaintag.add(choice);
				if (choice) {
					if (choice == 'yb_jianyuan_jin' && !player.isDisabled(1)) {
						player.disableEquip('equip1');
					}
					if (choice == 'yb_jianyuan_tu' && !player.isDisabled(2)) {
						player.disableEquip('equip2');
					}
					if (choice == 'yb_jianyuan_shui' && !player.isDisabled(3)) {
						player.disableEquip('equip3');
					}
					if (choice == 'yb_jianyuan_huo' && !player.isDisabled(4)) {
						player.disableEquip('equip4');
					}
					if (choice == 'yb_jianyuan_mu' && !player.isDisabled(5)) {
						player.disableEquip('equip5');
					}
				}
				player.addSkill(choice);
			}
		},
	},

	yb_jianyuan_jin: {
		forced: true,
		mod: {
			attackRange(player, num) {
				return num + 2;
			},
		},
		mark: true,
		marktext: '金',
		intro: {
			name: '金剑元',

			mark(dialog, storage, player) {
				if (player.getExpansions('yb_jianyuan_jin')) {
					const content = player.getExpansions('yb_jianyuan_jin');
					dialog.addAuto(content);
					dialog.addText('锁定技,你的攻击范围加2;当你使用杀时,你无视对方防具.<span class=yellowtext>当你造成伤害时,你可以移除金剑元,令伤害+1.</span>');
				} else {
					dialog.addText('你现在并没有金剑元');
				}
			},
		},
		nobracket: true,
		onremove(player, skill) {
			let cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
			player.unmarkSkill(skill);
		},
		inherit: 'qinggang_skill',
		group: 'yb_jianyuan_jin_remove',
		subSkill: {
			remove: {
				trigger: {
					source: 'damageBegin1',
				},
				prompt: '是否移除金剑元,令此伤害+1',
				content() {
					player.removeSkill('yb_jianyuan_jin');
					trigger.num++;
				},
			},
		},
	},
	yb_jianyuan_mu: {
		trigger: {
			player: 'loseAfter',
			global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		zhuijia: ['是否移除木剑元,然后摸等同体力上限数量的牌'],
		forced: true,
		filter(event, player) {
			if (player.countCards('h')) {
				return false;
			}
			let evt = event.getl(player);
			return evt && evt.player == player && evt.hs && evt.hs.length;
		},
		mark: true,
		marktext: '木',
		intro: {
			name: '木剑元',

			mark(dialog, storage, player) {
				if (player.getExpansions('yb_jianyuan_jin')) {
					const content = player.getExpansions('yb_jianyuan_mu');
					dialog.addAuto(content);
					dialog.addText('当你失去最后的手牌时,你可以摸一张牌,<span class=yellowtext>然后你可以移除木剑元并摸等同体力上限的牌数.</span>');
				} else {
					dialog.addText('你现在并没有木剑元');
				}
			},
		},
		nobracket: true,
		onremove(player, skill) {
			let cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
			player.unmarkSkill(skill);
		},
		content() {
			'step 0';
			player.draw();
			player.chooseBool(get.prompt('yb_jianyuan_mu', player), lib.skill.yb_jianyuan_mu.zhuijia);
			('step 1');
			if (result.bool) {
				player.removeSkill('yb_jianyuan_mu');
				player.draw(player.maxHp);
			}
		},
		ai: {
			threaten: 0.8,
			effect: {
				target(card) {
					if (card.name == 'guohe' || card.name == 'liuxinghuoyu') {
						return 0.5;
					}
				},
			},
			noh: true,
			skillTagFilter(player, tag) {
				if (tag == 'noh') {
					if (player.countCards('h') != 1) {
						return false;
					}
				}
			},
		},
	},
	yb_jianyuan_tu: {
		mark: true,
		marktext: '土',
		intro: {
			name: '土剑元',

			mark(dialog, storage, player) {
				if (player.getExpansions('yb_jianyuan_jin')) {
					const content = player.getExpansions('yb_jianyuan_tu');
					dialog.addAuto(content);
					dialog.addText('你可以将一张装备牌当【无中生有】使用.<span class=yellowtext>当你受到伤害时,你可以移除土剑元,令伤害-1.</span>');
				} else {
					dialog.addText('你现在并没有土剑元');
				}
			},
		},
		nobracket: true,
		onremove(player, skill) {
			let cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
			player.unmarkSkill(skill);
		},
		enable: ['chooseToUse'],
		filterCard(card, player) {
			return get.type(card) == 'equip';
		},
		position: 'hes',
		viewAs: { name: 'wuzhong' },
		viewAsFilter(player) {
			if (!player.countCards('hes', { type: 'equip' })) {
				return false;
			}
		},
		prompt: '将一张装备牌当无中生有使用',
		check(card) {
			let val = get.value(card);
			if (_status.event.name == 'chooseToRespond') {
				return 1 / Math.max(0.1, val);
			}
			return 5 - val;
		},
		group: 'yb_jianyuan_tu_remove',
		subSkill: {
			remove: {
				trigger: {
					player: 'damageBegin3',
				},
				prompt: '是否移除土剑元,令此伤害-1',
				content() {
					player.removeSkill('yb_jianyuan_tu');
					trigger.num--;
				},
			},
		},
	},
	yb_jianyuan_huo: {
		mark: true,
		marktext: '火',
		intro: {
			name: '火剑元',

			mark(dialog, storage, player) {
				if (player.getExpansions('yb_jianyuan_jin')) {
					const content = player.getExpansions('yb_jianyuan_huo');
					dialog.addAuto(content);
					dialog.addText('出牌阶段限一次,你可以将所有手牌当任意锦囊使用.<span class=yellowtext>当你使用牌指定目标后,你可以移除火剑元,弃置此牌目标各一张牌.</span>');
				} else {
					dialog.addText('你现在并没有火剑元');
				}
			},
		},
		nobracket: true,
		onremove(player, skill) {
			let cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
			player.unmarkSkill(skill);
		},
		inherit: 'qice',
		group: 'yb_jianyuan_huo_remove',
		subSkill: {
			remove: {
				trigger: {
					player: 'useCard',
				},
				prompt: '是否移除火剑元,弃置此牌目标各一张牌',
				filter(event, player) {
					if (!event.targets || event.targets.length < 1) {
						return false;
					}
					return true;
				},
				content() {
					'step 0';
					player.removeSkill('yb_jianyuan_huo');
					const targets = trigger.targets;
					for (const i of targets) {
						player.discardPlayerCard(i, 'he', 1, true);
					}
				},
			},
		},
	},
	yb_jianyuan_shui: {
		mark: true,
		marktext: '水',
		intro: {
			name: '水剑元',

			mark(dialog, storage, player) {
				if (player.getExpansions('yb_jianyuan_jin')) {
					const content = player.getExpansions('yb_jianyuan_shui');
					dialog.addAuto(content);
					dialog.addText('当你成为其他角色使用【杀】的目标时,你可以依次选择是否①弃置一张牌,将此杀【流离】出去;<span class=yellowtext>②移除水剑元,然后与一名可成为【流离】目标的其它角色互换座位.</span>');
				} else {
					dialog.addText('你现在并没有水剑元');
				}
			},
		},
		nobracket: true,
		onremove(player, skill) {
			let cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
			player.unmarkSkill(skill);
		},
		trigger: { target: 'useCardToTarget' },
		forced: true,
		preHidden: true,
		filter(event, player) {
			if (event.card.name != 'sha') {
				return false;
			}
			return game.hasPlayer(function (current) {
				return player.inRange(current) && current != event.player && current != player && lib.filter.targetEnabled(event.card, event.player, current);
			});
		},
		content() {
			'step 0';
			const next = player
				.chooseCardTarget({
					position: 'he',
					filterCard: lib.filter.cardDiscardable,
					filterTarget(card, player, target) {
						const trigger = _status.event;
						if (player.inRange(target) && target != trigger.source) {
							if (lib.filter.targetEnabled(trigger.card, trigger.source, target)) {
								return true;
							}
						}
						return false;
					},
					ai1(card) {
						return get.unuseful(card) + 9;
					},
					ai2(target) {
						if (_status.event.player.countCards('h', 'shan')) {
							return -get.attitude(_status.event.player, target);
						}
						if (get.attitude(_status.event.player, target) < 5) {
							return 6 - get.attitude(_status.event.player, target);
						}
						if (_status.event.player.hp == 1 && player.countCards('h', 'shan') == 0) {
							return 10 - get.attitude(_status.event.player, target);
						}
						if (_status.event.player.hp == 2 && player.countCards('h', 'shan') == 0) {
							return 8 - get.attitude(_status.event.player, target);
						}
						return -1;
					},
					prompt: get.prompt('yb_jianyuan_shui'),
					prompt2: '弃置一张牌,将此【杀】转移给攻击范围内的一名其他角色',
					source: trigger.player,
					card: trigger.card,
				})
				.setHiddenSkill(event.name);
			('step 1');
			if (result.bool) {
				let target = result.targets[0];
				player.discard(result.cards);
				let evt = trigger.parent;
				evt.triggeredTargets2.remove(player);
				evt.targets.remove(player);
				evt.targets.push(target);
			}
			('step 2');
			player
				.chooseTarget('是否移除水剑元,与一名能成为流离目标的玩家交换座位？现在由于作者菜,这个没写出来……')
				.set('filterTarget', function (card, player, target) {
					const trigger = _status.event;
					if (player.inRange(target) && target != trigger.source) {
						if (lib.filter.targetEnabled(trigger.card, trigger.source, target)) {
							return true;
						}
					}
					return false;
				})
				.setHiddenSkill(event.name);
			('step 3');
			if (result.bool) {
				let target = result.targets[0];
				game.broadcastAll(
					function (target1, target2) {
						game.swapSeat(target1, target2);
					},
					player,
					target,
				);
			}
		},
		ai: {
			effect: {
				target(card, player, target) {
					if (target.countCards('he') == 0) {
						return;
					}
					if (card.name != 'sha') {
						return;
					}
					let min = 1;
					const friend = get.attitude(player, target) > 0;
					const vcard = { name: 'shacopy', nature: card.nature, suit: card.suit };
					const players = game.filterPlayer();
					for (let i = 0; i < players.length; i++) {
						if (player != players[i] && get.attitude(target, players[i]) < 0 && target.canUse(card, players[i])) {
							if (!friend) {
								return 0;
							}
							if (get.effect(players[i], vcard, player, player) > 0) {
								if (!player.canUse(card, players[0])) {
									return [0, 0.1];
								}
								min = 0;
							}
						}
					}
					return min;
				},
			},
		},
	},

	yb028_sheshen: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'disableEquipAfter' },
		forced: true,
		content() {
			'step 0';
			player
				.chooseTarget(true)
				.set('prompt', '请选择一名角色,令其摸两张牌并回复1点体力')
				.set('ai', function (target) {
					const player = _status.event.player;
					let att = get.attitude(player, target) / Math.sqrt(1 + target.countCards('h'));
					return att;
				});
			('step 1');
			if (result.bool) {
				const tar = result.targets[0];
				tar.draw(2);
				tar.recover();
				player.loseMaxHp();
			}
		},
		group: ['yb028_sheshen_max'],
		subSkill: {
			max: {
				mod: {
					maxHandcard(player, num) {
						let numb = player.countDisabled();
						return num + numb;
					},
				},
				trigger: {
					player: 'loseMaxHpBegin',
				},
				forced: true,
				filter: (event, player) => player.maxHp <= 1,
				content() {
					trigger.cancel();
				},
			},
		},
	},

	yb028_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb029_chonghui: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['useCard', 'respond'],
		},
		filter(event, player) {
			return !player.getStorage('yb029_chonghui2').includes(event.card.name) && !event.card.isCard;
		},
		forced: true,
		content() {
			'step 0';
			player.draw();
			('step 1');
			if (!player.storage.yb029_chonghui2) {
				player.storage.yb029_chonghui2 = [];
			}
			player.storage.yb029_chonghui2.push(trigger.card.name);
			player.addTempSkill('yb029_chonghui2');
		},
		group: ['yb029_chonghui_juedou', 'yb029_chonghui_youdishenru'],
		subSkill: {
			youdishenru: {
				audio: 'yb029_chonghui',
				usable: 1,
				enable: ['chooseToUse'],
				filterCard: 1,
				viewAs: { name: 'youdishenru' },
				prompt: '将一张手牌当作诱敌深入使用',
				check(event, player, card) {
					if (event.card == 'shan') {
						return 0.5;
					}
					return 1.5;
				},
				position: 'hs',
				viewAsFilter(player) {
					if (!player.countCards('hs')) {
						return false;
					}
				},
				ai: {
					skillTagFilter(player) {
						if (!player.countCards('hs')) {
							return false;
						}
					},
					effect: {
						target(card, player, target, current) {
							if (get.tag(card, 'respondShan') && current < 0) {
								return 0.6;
							}
						},
					},
					order: 4,
					useful: -1,
					value: -1,
				},
			},
			juedou: {
				audio: 'yb029_chonghui',
				usable: 1,
				enable: ['chooseToUse'],
				filterCard: 1,
				viewAs: { name: 'juedou' },
				prompt: '将一张手牌当作【决斗】使用',
				check(event, player, card) {
					if (event.card == 'sha') {
						return 0.5;
					}
					return 1.5;
				},
				position: 'hs',
				viewAsFilter(player) {
					if (!player.countCards('hs')) {
						return false;
					}
				},
				ai: {
					skillTagFilter(player) {
						if (!player.countCards('hs')) {
							return false;
						}
					},
					order: 4,
					useful: -1,
					value: -1,
				},
			},
		},
	},
	yb029_chonghui2: { onremove: true },
	yb029_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb030_jiangdao: {
		audio: 'yb030_rejiangdao',
		group: ['yb030_rejiangdao_1', 'yb030_rejiangdao_2'],
	},
	yb030_rejiangdao: {
		audio: 'ext:夜白神略/audio/character:2',
		group: ['yb030_rejiangdao_1', 'yb030_rejiangdao_2', 'yb030_rejiangdao_3'],
		subSkill: {
			1: {},
			2: {},
			3: {},
		},
	},

	yb018_lihun: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterTarget(card, player, target) {
			return player != target;
		},
		filterCard: true,
		position: 'he',
		content() {
			player.gainPlayerCard(target, true, 'h', target.countCards('h'));
			player.addSkill('yb018_lihun2');
			player.storage.yb018_lihun = target;
			player.markSkill('yb018_lihun2');
		},
		check(card) {
			return 8 - get.value(card);
		},
		ai: {
			order: 10,
			result: {
				player(player) {
					if (player.classList.contains('turnedover')) {
						return 10;
					}
					return 0;
				},
				target(player, target) {
					if (target.countCards('h') > target.hp) {
						return target.hp - target.countCards('h');
					}
					return 0;
				},
			},
			threaten: 1.5,
			effect: {
				target(card) {
					if (card.name == 'guiyoujie') {
						return [0, 2];
					}
				},
			},
		},
		group: ['yb018_lihun_2'],
		subSkill: {
			2: {
				trigger: { player: 'phaseUseBefore' },
				forced: true,
				filter(event, player) {
					if (!player.hasSkill('yb018_lihun2')) {
						return false;
					}
					return true;
				},
				content() {
					player.removeSkill('yb018_lihun2');
				},
			},
		},
	},
	yb018_lihun2: {
		trigger: { player: 'phaseUseEnd' },
		forced: true,
		popup: false,
		mod: {
			globalFrom(from, to) {
				if (from.storage.yb018_lihun && from.storage.yb018_lihun.includes(to)) {
					return -Infinity;
				}
			},
		},
		intro: {
			content(content, player) {
				return '至' + get.translation(player.storage.yb018_lihun) + '的距离视为1';
			},
		},
		content() {
			'step 0';
			let cards = player.getCards('he');
			player.removeSkill('yb018_lihun2');
			if (player.storage.yb018_lihun.classList.contains('dead') || player.storage.yb018_lihun.hp <= 0 || cards.length == 0) {
				event.finish();
			} else {
				if (cards.length < player.storage.yb018_lihun.hp) {
					event._result = { bool: true, cards: cards };
				} else {
					player.chooseCard('he', true, player.storage.yb018_lihun.hp, '离魂:选择要交给' + get.translation(player.storage.yb018_lihun) + '的牌');
				}
				player.turnOver();
			}
			('step 1');
			player.storage.yb018_lihun.gain(result.cards, player);
			player.$give(result.cards.length, player.storage.yb018_lihun);
		},
	},
	yb018_wanyue: {
		inherit: 'yb001_wanyue',
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb018_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb032_tonglv: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb032_zhuiji: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb032_duanchang: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb033_huiyue: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: { player: 'phaseBegin' },
		filter(event, player) {
			let num = (player.maxHp * 2) / 3;
			return player.hp > num && !player.hasSkill('yb033_shuhui');
		},
		content() {
			player.addSkill('yb033_shuhui');
		},
		derivation: ['yb033_shuhui', 'yb033_yuqi', 'yb014_lvxin'],
		group: ['yb033_huiyue_yuqi', 'yb033_huiyue_lvxin', 'yb033_huiyue_botu'],
		subSkill: {
			yuqi: {
				audio: 'yb033_huiyue',
				forced: true,
				trigger: { player: 'damageBegin4' },
				filter(event, player) {
					if (player.hasSkill('yb033_yuqi')) {
						return player.hasSkill('yb033_shuhui') && !player.storage.yb033_shuhui;
					}
					return true;
				},
				content() {
					if (!player.hasSkill('yb033_yuqi')) {
						player.addSkill('yb033_yuqi');
					}
					if (player.hasSkill('yb033_shuhui')) {
						player.storage.yb033_shuhui = true;
						game.log(player, '修改了', '#b淑慧');
					}
				},
			},
			lvxin: {
				audio: 'yb033_huiyue',
				forced: true,
				trigger: { player: 'phaseJieshuBegin' },
				filter(event, player) {
					if (player.hasSkill('yb014_lvxin')) {
						return false;
					}
					const history = player.getHistory('useCard', function (evt) {
						return evt.isPhaseUsing();
					});
					const suits = [];
					for (let i = 0; i < history.length; i++) {
						const suit = get.type2(history[i].card);
						if (suit) {
							suits.add(suit);
						}
					}
					return suits.length >= 2;
				},
				content() {
					player.addSkill('yb014_lvxin');
				},
			},
			botu: {
				audio: 'yb033_huiyue',
				forced: true,
				round: 1,
				trigger: { player: 'phaseJieshuBegin' },
				filter(event, player) {
					const history = player.getHistory('useCard', function (evt) {
						return evt.isPhaseUsing();
					});
					const suits = [];
					for (let i = 0; i < history.length; i++) {
						const suit = get.type2(history[i].card);
						if (suit) {
							suits.add(suit);
						}
					}
					return suits.length >= 3;
				},
				content() {
					player.phase('nodelay');
				},
			},
		},
	},
	yb033_shuhui: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseBegin',
		},
		forced: true,
		content() {
			'step 0';
			player.chooseCardTarget({
				position: 'h',
				selectCard: 1,
				selectTarget: 1,
				filterCard: lib.filter.cardDiscardable,
				filterTarget(card, player, target) {
					return ui.selected.cards.length == 1;
				},
				ai1(card) {
					return get.unuseful(card) + 9;
				},
				ai2(target) {
					let att = get.attitude(_status.event.player, target);

					if (target.isDamaged() && att > 0) {
						return Math.min(2, 5 - target.hp);
					}
					if (att < 0) {
						return Math.min(1, 4 - target.hp);
					}
					return -1;
				},
				prompt: '请选择一名角色和一张手牌,令其掉血或回血',
			});
			('step 1');
			if (result.bool) {
				event.card = result.cards[0];
				event.target = result.targets[0];
				let list = [];
				if (event.target.isDamaged()) {
					list.push('回血');
				}
				list.push('掉血');
				if (list.length == 1) {
					event._result = { control: list[0] };
				} else {
					player.chooseControl(list).set('prompt', '请选择令' + get.translation(event.target) + '回血还是掉血');
				}
			}
			('step 2');
			switch (result.control) {
				case '回血':
					player.discard(event.card);
					event.target.recover();
					delete result.control;
					break;
				case '掉血':
					player.discard(event.card);
					event.target.loseHp();
					delete result.control;
					break;
			}
			('step 3');
			if (player.storage.yb033_shuhui == true) {
				let card = get.cards(1);
				event.numb = card[0].number;
				event.card = card;
			} else {
				event.finish();
			}
			('step 4');
			player.showCards(event.card);
			let list = lib.skill.yb033_yuqi.getInfo(player);
			let min = list[0],
				index = 0;
			for (let i = 1; i < list.length; ++i) {
				if (list[i] < min) {
					min = list[i];
					index = i;
				}
			}
			event.numa = min;
			event.numc = Math.min(event.numa + 2, event.numb);
			player
				.chooseControl('<span class=thundertext>蓝色(' + list[0] + ')</span>', '<span class=firetext>红色(' + list[1] + ')</span>', '<span class=greentext>绿色(' + list[2] + ')</span>', '<span class=yellowtext>黄色(' + list[3] + ')</span>', 'cancel2')
				.set('prompt', get.prompt('yb033_shuhui'))
				.set('prompt2', '令〖隅泣〗中的一个数字改为' + event.numc + ',新数字不会小于原数字')
				.set('ai', function () {
					let min = list[0],
						index = 0;
					for (let i = 1; i < list.length; ++i) {
						if (list[i] < min) {
							min = list[i];
							index = i;
						}
					}
					return index;
				});
			('step 5');
			if (result.control && result.control != 'cancel2') {
				let list = lib.skill.yb033_yuqi.getInfo(player);
				list[result.index] = Math.max(event.numc, list[result.index]);
				game.log(player, '将', result.control, '数字改为', '#y' + list[result.index]);
				player.markSkill('yb033_yuqi');
			}
		},
	},
	yb033_yuqi: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 3,
		trigger: { global: 'damageEnd' },
		init(player) {
			if (!player.storage.yb033_yuqi) {
				player.storage.yb033_yuqi = [2, 3, 2, 2];
			}
		},
		getInfo(player) {
			if (!player.storage.yb033_yuqi) {
				player.storage.yb033_yuqi = [2, 3, 2, 2];
			}
			return player.storage.yb033_yuqi;
		},
		filter(event, player) {
			let list = lib.skill.yb033_yuqi.getInfo(player);

			return event.player.isIn() && get.distance(player, event.player) <= list[0];
		},
		logTarget: 'player',
		content() {
			'step 0';
			event.list = lib.skill.yb033_yuqi.getInfo(player);
			player.YB_yuqi(['隅泣', event.list[1], event.list[2], event.list[3]], trigger.player);
		},
		mark: true,
		intro: {
			content(storage, player) {
				const info = lib.skill.yb033_yuqi.getInfo(player);
				return '<div class="text center"><span class=thundertext>蓝色:' + info[0] + '</span>　<span class=firetext>红色:' + info[1] + '</span><br><span class=greentext>绿色:' + info[2] + '</span>　<span class=yellowtext>黄色:' + info[3] + '</span></div>';
			},
		},
	},
	yb033_lvxin: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb033_beilei: {
		forced: true,
		audio: 'ext:夜白神略/audio/character:2',
		mod: {
			cardUsable(card, player, num) {
				return Infinity;
			},
			cardEnabled2(card) {
				if (get.position(card) == 'h' && card.hasGaintag('yb033_beilei')) {
					return false;
				}
			},
		},
		trigger: {
			player: 'drawAfter',
		},
		filter(event, player) {
			return true;
		},
		content() {
			let cards = player.getCards('h');
			for (const i of cards) {
				if (!trigger.result.includes(i)) {
					i.addGaintag('yb033_beilei');
				}
			}
		},
	},
	yb033_qijue: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'phaseUseBegin',
		},
		filter() {
			return true;
		},
		content() {
			'step 0';
			const choiceList = ['失去1点体力', '受到1点伤害', '弃置一张牌'];
			if (!player.countDiscardableCards(player, 'h')) {
				choiceList.remove('弃置一张牌');
			}
			player
				.chooseControl()
				.set('choiceList', choiceList)
				.set('ai', function () {
					if (choiceList.length > 2 && !event.not2) {
						return 2;
					}
					return 0;
				});
			('step 1');
			if (result.index == 2) {
				player.chooseToDiscard('h');
			} else if (result.index == 0) {
				player.loseHp();
				event.finish();
			} else if (result.index == 1) {
				player.damage();
				event.finish();
			}
			('step 2');
			if (result.index == 2 && !result.cards) {
				event.not2 = true;
				event.goto(0);
			}
		},

		init(player) {
			if (!player.storage.yb033_qijue_lh) {
				player.storage.yb033_qijue_lh = [
					['①你下次失去体力后', 'loseHpEnd'],
					[
						'②回复此数值*2点体力',
						function () {
							player.recover(trigger.num * 2);
						},
					],
					[
						'③弃置一张手牌',
						function () {
							player.chooseToDiscard('h', true);
						},
					],
				];
			}
			if (!player.storage.yb033_qijue_da) {
				player.storage.yb033_qijue_da = [
					['①你下次受到伤害后', 'damageEnd'],
					[
						'②摸此数值*3张牌',
						function () {
							player.draw(trigger.num * 3);
						},
					],
					[
						'③失去1点体力',
						function () {
							player.loseHp(1);
						},
					],
				];
			}
			if (!player.storage.yb033_qijue_dc) {
				player.storage.yb033_qijue_dc = [
					['①你下次弃置牌后', 'discardEnd'],
					[
						'②对所有其他角色各造成1点伤害',
						function () {
							const targets = game.filterPlayer().sortBySeat(player);
							for (const i of targets) {
								if (i.isIn() && i != player) {
									i.damage(player);
								}
							}
						},
					],
					[
						'③令一个数字之后的效果向前错位',
						function () {
							const dialog = ui.create.dialog('泣绝:令一个数字之后的效果上移', 'forcebutton', 'hidden');
							const sto1 = player.storage.yb033_qijue_lh;
							const sto2 = player.storage.yb033_qijue_da;
							const sto3 = player.storage.yb033_qijue_dc;
							const str = '<div style = "font-size : 16px">';
							const itemContainerCss = { border: 'solid #c6b3b3 2px' };
							function clickItemContainer(container) {
								if (!container.classList.contains('selected')) {
									if (ui.selected.buttons.length) {
										return;
									}
									container.classList.add('selected');
									ui.selected.buttons.add(container);
									for (let i = container.link; i < dialog.itemContainers.length - 1; i++) {
										dialog.itemContainers[i + 1].innerHTML = '<div class="caption item">' + str + sto2[i][0] + '<br>' + sto3[i][0] + '<br> ' + sto1[i][0];
									}
								} else {
									container.classList.remove('selected');
									ui.selected.buttons.remove(container);
									for (let i = container.link; i < dialog.itemContainers.length - 1; i++) {
										dialog.itemContainers[i + 1].innerHTML = '<div class="caption item">' + str + sto1[i][0] + '<br>' + sto2[i][0] + '<br> ' + sto3[i][0];
									}
								}
								game.check();
							}
							dialog.addNewRow({ item: str + '当你失去体力后<br>当你失去体力后<br>你下次弃置牌后', ratio: 1 }, { item: str + sto1[0][0] + '<br>' + sto2[0][0] + '<br> ' + sto3[0][0], ratio: 1.3, itemContainerCss, clickItemContainer }, { item: str + sto1[1][0] + '<br>' + sto2[1][0] + '<br> ' + sto3[1][0], ratio: 1.7, itemContainerCss, clickItemContainer }, { item: str + sto1[2][0] + '<br>' + sto2[2][0] + '<br> ' + sto3[2][0], ratio: 2, itemContainerCss, clickItemContainer });
							for (const i in dialog.itemContainers) {
								dialog.itemContainers[i].link = i - 1;
							}
							player
								.chooseButton(dialog, true)
								.set('processAI', () => ({ bool: true, links: [2] }))
								.set('custom', {
									add: {},
									replace: { window() { } },
								})
								.set('callback', function (player, result) {
									const link = result.links;
									const storageC1 = player.storage.yb033_qijue_lh;
									const storageC2 = player.storage.yb033_qijue_da;
									const storageC3 = player.storage.yb033_qijue_dc;
									if (link) {
										if (link[0] == 0) {
											const storageC4 = storageC1;
											player.storage.yb033_qijue_lh[0] = storageC2[0];
											player.storage.yb033_qijue_lh[1] = storageC2[1];
											player.storage.yb033_qijue_lh[2] = storageC2[2];
											player.storage.yb033_qijue_da[0] = storageC3[0];
											player.storage.yb033_qijue_da[1] = storageC3[1];
											player.storage.yb033_qijue_da[2] = storageC3[2];
											player.storage.yb033_qijue_dc[0] = storageC4[0];
											player.storage.yb033_qijue_dc[1] = storageC4[1];
											player.storage.yb033_qijue_dc[2] = storageC4[2];
										} else if (link[0] == 1) {
											const storageC4 = storageC1;
											player.storage.yb033_qijue_lh[1] = storageC2[1];
											player.storage.yb033_qijue_lh[2] = storageC2[2];
											player.storage.yb033_qijue_da[1] = storageC3[1];
											player.storage.yb033_qijue_da[2] = storageC3[2];
											player.storage.yb033_qijue_dc[1] = storageC4[1];
											player.storage.yb033_qijue_dc[2] = storageC4[2];
										} else if (link[0] == 2) {
											const storageC4 = storageC1;
											player.storage.yb033_qijue_lh[2] = storageC2[2];
											player.storage.yb033_qijue_da[2] = storageC3[2];
											player.storage.yb033_qijue_dc[2] = storageC4[2];
										}
									}
								});
						},
					],
				];
			}
		},
		group: ['yb033_qijue_lh', 'yb033_qijue_da', 'yb033_qijue_dc'],
		subSkill: {
			lh: {
				audio: 'yb033_qijue',
				trigger: {
					player: 'loseHpEnd',
				},
				firstDo: true,

				forced: true,
				filter(event, player) {
					return !player.storage.yb033_qijue_loseHp;
				},
				content() {
					'step 0';
					if (!player.storage.yb033_qijue_lh) {
						lib.skill.yb033_qijue.init(player);
					}

					player.storage.yb033_qijue_loseHp = true;
					('step 1');
					const storage = player.storage.yb033_qijue_lh;
					player
						.when({ player: storage[0][1] })
						.filter(function (event, player) {
							return event != trigger;
						})
						.then(storage[1][1])
						.then(storage[2][1])
						.then(function () {
							delete player.storage.yb033_qijue_loseHp;
						});
				},
			},
			da: {
				audio: 'yb033_qijue',
				trigger: {
					player: 'damageEnd',
				},
				firstDo: true,

				forced: true,
				filter(event, player) {
					return !player.storage.yb033_qijue_damage;
				},
				content() {
					'step 0';
					if (!player.storage.yb033_qijue_da) {
						lib.skill.yb033_qijue.init(player);
					}

					player.storage.yb033_qijue_damage = true;
					('step 1');
					const storage = player.storage.yb033_qijue_da;
					player
						.when({ player: storage[0][1] })
						.filter(function (event, player) {
							return event != trigger;
						})
						.then(storage[1][1])
						.then(storage[2][1])
						.then(function () {
							delete player.storage.yb033_qijue_damage;
						});
				},
			},
			dc: {
				audio: 'yb033_qijue',
				trigger: {
					player: 'discardEnd',
				},
				firstDo: true,

				forced: true,
				filter(event, player) {
					return !player.storage.yb033_qijue_discard;
				},
				content() {
					'step 0';
					if (!player.storage.yb033_qijue_dc) {
						lib.skill.yb033_qijue.init(player);
					}

					player.storage.yb033_qijue_discard = true;
					('step 1');
					const storage = player.storage.yb033_qijue_dc;
					player
						.when({ player: storage[0][1] })
						.filter(function (event, player) {
							return event != trigger;
						})
						.then(storage[1][1])
						.then(storage[2][1])
						.then(function () {
							delete player.storage.yb033_qijue_discard;
						});
				},
			},
		},
	},

	yb034_bifa: {
		enable: 'phaseUse',
		audio: 'ext:夜白神略/audio/character:2',

		filter(event, player) {
			if (player.countCards('h') <= 0) {
				return false;
			}
			return (
				game.countPlayer(function (current) {
					return current.hasSkill('yb034_bifa_card');
				}) <= 0
			);
		},
		filterTarget(card, player, target) {
			return player != target;
		},
		filterCard: true,
		check(card) {
			return 8 - get.value(card);
		},
		discard: false,
		lose: false,
		delay: false,
		position: 'h',
		content() {
			'step 0';
			player.give(cards[0], target);
			target.storage.yb034_bifa_card = cards[0];
			target.addTempSkill('yb034_bifa_card', 'YB_anyAfter');
		},
		ai: {
			order: 9,
			result: {
				target(player, target) {
					return -target.countCards('he') - (player.countCards('h', 'du') ? 1 : 0);
				},
			},
			threaten: 2,
		},
		subSkill: {
			card: {
				trigger: { player: 'die' },
				forced: true,
				forceDie: true,
				filter(event, player) {
					return (
						game.countPlayer(function (current) {
							return current.hasSkill('yb034_bifa');
						}) > 0
					);
				},
				content() {
					let list = game.filterPlayer(function (current) {
						return current.hasSkill('yb034_bifa');
					});
					for (const i of list) {
						i.draw();
					}
				},
				mod: {
					cardEnabled2(card, player) {
						if (!player.storage.yb034_bifa_card) {
							if (get.position(card) == 'h') {
								return false;
							}
						} else if (get.position(card) == 'h' && get.color(card) == get.color(player.storage.yb034_bifa_card)) {
							return false;
						}
					},
				},
				mark: true,
				marktext: '禁',
				intro: {
					name: '笔伐',
					content(storage, player) {
						let str = '不能使用或打出';
						if (player.storage.yb034_bifa_card) {
							str += get.translation(get.color(player.storage.yb034_bifa_card));
						}
						str += '手牌';
						return str;
					},
				},
			},
		},
	},
	yb034_rebifa: {
		enable: 'phaseUse',
		audio: 'ext:夜白神略/audio/character:2',
		filter(event, player) {
			if (player.countCards('h') <= 0) {
				return false;
			}
			return (
				game.countPlayer(function (current) {
					return current.hasSkill('yb034_bifa_card');
				}) <= 0
			);
		},
		filterTarget(card, player, target) {
			return player != target;
		},
		filterCard: true,
		check(card) {
			return 8 - get.value(card);
		},
		discard: false,
		lose: false,
		delay: false,
		position: 'h',
		content() {
			'step 0';
			player.give(cards[0], target);
			if (target.storage.yb034_bifa_card) {
				delete target.storage.yb034_bifa_card;
			}
			target.addTempSkill('yb034_bifa_card', 'YB_anyAfter');
		},
		ai: {
			order: 9,
			result: {
				target(player, target) {
					return -target.countCards('he') - (player.countCards('h', 'du') ? 1 : 0);
				},
			},
			threaten: 2,
		},
	},
	yb034_jiandao: {
		inherit: 'yb034_rejiandao',
		filter(event, player) {
			return player.getEquip(1);
		},
	},
	yb034_rejiandao: {
		mod: {
			maxHandcard(player, num) {
				return num + 1;
			},
			cardUsable(card, player) {
				if (card.name == 'sha' && card.storage && card.storage.xxx) {
					return Infinity;
				}
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',
		viewAs: { name: 'sha', storage: { xxx: true }, xxx: true },
		filterCard() {
			return false;
		},
		selectCard: -1,
		prompt: '视为使用一张杀(无次数限制)',
	},
	yb034_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},
	ybceshijineng1: {
		mod: {
			targetInRange(card, player, target, now) {
				if (card.name == 'sha' && card.storage && card.storage.xx) {
					return true;
				}
			},
		},
		usable: 2,
		enable: 'phaseUse',
		viewAs: { name: 'sha', nature: 'thunder', storage: { xx: true } },
		filterCard() {
			return false;
		},
		selectCard: -1,
		prompt: '视为使用一张雷杀(无距离限制)',
		precontent() {
			player.link(true);
			const next = game.createEvent('afterEffect', null, { next: [] });
			next.player = player;
			next.setContent(function () {
				const history = player.getHistory('useCard', (evt) => evt.parent == event.parent);
				if (history.length) {
					for (let target of history.map((value) => value.targets).flat()) {
						target.link(true);
					}
				}
			});
			event.parent.after.unshift(next);
		},
	},

	yb035_zhengzhao: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseZhunbeiBegin',
		},
		filter(event, player) {
			return event.player != player && event.player.maxHp >= player.maxHp;
		},
		forced: true,
		content: [
			async function (event, trigger, player) {
				trigger.player.chooseToGive(player, 1, 'h', '①交给' + get.translation(player) + '一张手牌,②减少1点体力上限').set('ai', function (card) {
					const trigger = _status.event.getTrigger();
					if (get.attitude(trigger.player, player) > 5) {
						return 10 - get.value(card);
					}

					return false;
				});
			},
			async function (event, trigger, player) {
				const result = event._result;
				if (!result.bool) {
					trigger.player.loseMaxHp();
				}
			},
		],
	},
	yb035_jitian: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		filter(event, player) {
			return true;
		},
		cost() {
			'step 0';
			player
				.chooseControl()
				.set('prompt', '祭天:请选择一项')
				.set('choiceList', ['减少1点体力上限并回复1点体力', '增加1点体力上限并失去1点体力', '取消'])
				.set('ai', () => {
					if (player.maxHp >= 4 && player.maxHp - player.hp >= 2) {
						return 0;
					} else if (player.hp >= 2) {
						return 1;
					} else {
						return 2;
					}
				});
			('step 1');
			if (result.index != 2) {
				event.result = { bool: true, cost_data: result.index };
			}
		},
		content() {
			'step 0';
			if (event.cost_data == 0) {
				player.loseMaxHp();
				player.recover();
			} else {
				player.gainMaxHp();
				player.loseHp();
			}
			('step 1');
			player.draw(2);
		},
	},
	yb035_liuwang: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		derivation: ['yb035_weiyan'],
		limited: true,
		filter(event, player) {
			if (event.type == 'dying') {
				if (player != event.dying) {
					return false;
				}
				return true;
			}
			return false;
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			player.storage.yb035_liuwang = true;
			await player.recoverTo(1);
			await player.YB_fuhan([4, '流亡', 'all', 'zhu'], 'tw');
			await player.addSkill('yb035_weiyan');
		},
		ai: {
			order: 0.5,
			skillTagFilter(player, tag, target) {
				if (player != target || player.storage.yb035_liuwang) {
					return false;
				}
			},
			save: true,
			result: {
				player(player) {
					if (player.hp <= 0) {
						return 10;
					}
					return 0;
				},
			},
			threaten(player, target) {
				if (!target.storage.yb035_liuwang) {
					return 0.6;
				}
			},
		},
	},
	yb035_weiyan: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'useCardToTargeted',
		},
		filter(event, player) {
			return player != event.target && player.hp > event.target.hp && event.target.hp > 1;
		},
		content() {
			trigger.target.loseHp();
		},
	},

	yb036_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},
	yb036_qianjin: {
		audio: 'ext:夜白神略/audio/character:4',
		logAudio: () => 2,
		derivation: ['yb036_chongzheng', 'yb036_aoxiang'],
		dutySkill: true,
		forced: true,
		trigger: {
			player: ['useCard', 'phaseJieshuBegin', 'damageAfter'],
		},
		filter(event, player, name) {
			return true;
		},
		content() {
			if (event.triggername == 'useCard') {
				player.addMark('yb036_qianjin', 1);
				trigger.trigger('yb036_qianjin_change');
			} else if (player.countMark('yb036_qianjin') > 0) {
				player.removeMark('yb036_qianjin', 1);
				trigger.trigger('yb036_qianjin_change');
			} else {
				trigger.trigger('yb036_qianjin_fail');
			}
		},
		mark: true,
		marktext: '进',
		intro: {
			name: '进',
			content: '$',
		},

		group: ['yb036_qianjin_achieve', 'yb036_qianjin_fail'],
		subSkill: {
			achieve: {
				audio: 'yb036_qianjin',
				logAudio(event, player) {
					return ['ext:夜白神略/audio/yb036_qianjin3.mp3'];
				},
				trigger: {
					player: 'yb036_qianjin_change',
				},
				forced: true,
				filter(event, player) {
					let num = player.yb036_qianjin_achieve;
					if (player.countMark('yb036_qianjin') >= num) {
						return true;
					}
				},
				init(player) {
					if (!player.yb036_qianjin_achieve) {
						player.yb036_qianjin_achieve = 5;
					}
				},

				content() {
					'step 0';
					player.$skill('使命成功');
					player.changeSkin({ characterName: 'ybsl_036bright' }, 'ybsl_036bright_aoxiang');
					('step 1');
					player.awakenSkill('yb036_qianjin');
					('step 2');
					player.draw(2);
					('step 3');
					player.addSkill('yb036_aoxiang');
				},
			},
			fail: {
				audio: 'yb036_qianjin',
				logAudio(event, player) {
					return ['ext:夜白神略/audio/yb036_qianjin4.mp3'];
				},
				trigger: {
					player: 'yb036_qianjin_fail',
				},
				filter(event, player) {
					return true;
				},
				forced: true,
				content() {
					'step 0';
					player.$skill('使命失败');
					('step 1');
					player.awakenSkill('yb036_qianjin');
					player.changeSkin({ characterName: 'ybsl_036bright' }, 'ybsl_036bright_chongzheng');
					('step 2');
					player.addSkill('yb036_chongzheng');
					player.restoreSkill('yb036_chongzheng');
				},
			},
		},
	},
	yb036_chongzheng: {
		audio: 'ext:夜白神略/audio/character:2',
		limited: true,
		trigger: {
			player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
		},
		enable: 'chooseToUse',
		filter(event, player, name) {
			if (name) {
				return true;
			}
			if (player.storage.yb036_chongzheng) {
				return false;
			}
			if (event.type == 'dying') {
				if (player != event.dying) {
					return false;
				}
				return true;
			}
			return false;
		},
		check(event, player, name) {
			if (name) {
				return player.getDamagedHp() > 0 || player.countCards('h') <= 1;
			}
			return true;
		},
		content() {
			'step 0';
			player.awakenSkill('yb036_chongzheng');
			('step 1');
			player.recover();
			('step 2');
			player.draw(2);
			('step 3');
			player.restoreSkill('yb036_qianjin');
			player.changeSkin({ characterName: 'ybsl_036bright' }, 'ybsl_036bright');
		},
	},
	yb036_aoxiang: {
		audio: 'ext:夜白神略/audio/character:2',
		group: ['yb036_aoxiang_draw', 'yb036_aoxiang_restore'],
		subSkill: {
			draw: {
				forced: true,
				trigger: {
					player: ['useCard'],
				},
				filter(event, player) {
					return player.countMark('yb036_qianjin') > 0;
				},
				content() {
					'step 0';
					player.removeMark('yb036_qianjin', 1);
					trigger.trigger('yb036_qianjin_change');
					('step 1');
					player.draw();
				},
			},
			restore: {
				trigger: {
					player: 'yb036_qianjin_change',
				},
				forced: true,
				filter(event, player) {
					return player.countMark('yb036_qianjin') == 0;
				},

				content() {
					'step 0';
					player.removeSkill('yb036_aoxiang');
					player.restoreSkill('yb036_qianjin');
					player.changeSkin({ characterName: 'ybsl_036bright' }, 'ybsl_036bright');
					('step 1');
					if (player.yb036_qianjin_achieve) {
						let list = [];
						if (player.yb036_qianjin_achieve < 8) {
							list.push('增加');
						}
						if (player.yb036_qianjin_achieve > 3) {
							list.push('减少');
						}
						list.push('取消');
						player.chooseControl(list).set('prompt', `当前临界值为${player.yb036_qianjin_achieve},请选择增加还是减少(至多加至8,至少减至3)`);
					} else {
						event.finish();
					}
					('step 2');
					if (result.control && result.control != '取消') {
						if (result.control == '增加') {
							player.yb036_qianjin_achieve++;
						} else if (result.control == '减少') {
							player.yb036_qianjin_achieve--;
						}
					}
				},
			},
		},
		enable: ['chooseToUse', 'chooseToRespond'],

		prompt: '将红牌当【杀】,黑牌当【闪】使用或打出',

		viewAs(cards, player) {
			let name = false;
			const color = get.color(cards[0], player);

			switch (color) {
				case 'red':
					name = 'sha';
					break;
				case 'black':
					name = 'shan';
					break;
			}

			if (name) {
				return {
					name: name,
				};
			}
			return null;
		},
		check(card) {
			let val = get.value(card);
			return 5 - val;
		},
		selectCard: 1,
		position: 'hes',
		filterCard(card, player, event) {
			event = event || _status.event;

			const filter = event._backup.filterCard;

			let name = get.color(card, player);

			if (name == 'black' && filter({ name: 'shan', cards: [card] }, player, event)) {
				return true;
			}

			if (name == 'red' && filter({ name: 'sha', cards: [card] }, player, event)) {
				return true;
			}

			return false;
		},
		filter(event, player) {
			const filter = event.filterCard;

			if (filter({ name: 'sha' }, player, event) && player.countCards('hes', { color: 'red' })) {
				return true;
			}

			if (filter({ name: 'shan' }, player, event) && player.countCards('hes', { color: 'black' })) {
				return true;
			}
			return false;
		},

		ai: {
			respondSha: true,
			respondShan: true,

			skillTagFilter(player, tag) {
				let name;
				switch (tag) {
					case 'respondSha':
						name = 'red';
						break;
					case 'respondShan':
						name = 'black';
						break;
				}
				if (!player.countCards('hes', { color: name })) {
					return false;
				}
			},

			order(item, player) {
				return 2;
			},
		},
	},

	yb037_yizhong: {
		trigger: { target: 'shaBefore' },
		forced: true,
		audio: 'ext:夜白神略/audio/character:2',
		filter(event, player) {
			if (player.getEquip(2)) {
				return false;
			}
			return event.card && event.card.name == 'sha' && get.color(event.card) == 'black';
		},
		content() {
			trigger.cancel();
		},
		ai: {
			effect: {
				target(card, player, target) {
					if (player == target && get.subtype(card) == 'equip2') {
						if (get.equipValue(card) <= 8) {
							return 0;
						}
					}
					if (target.getEquip(2)) {
						return;
					}
					if (card.name == 'sha' && get.color(card) == 'black') {
						return 'zerotarget';
					}
				},
			},
		},
	},
	yb037_kexie: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'loseAfter' },
		forced: true,
		marktext: '咳',
		mark: true,
		intro: {
			name: '咳血',
			content: 'mark',
		},
		filter(event, player) {
			if (event.type != 'discard') {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			event.count = 0;
			let evt = trigger.getl(player);
			if (player.countMark('yb037_kexie') == 0) {
				event.count = evt.cards2.length;
				event.goto(1);
			}
			if (player.countMark('yb037_kexie') == 1) {
				for (let i = 0; i < evt.cards2.length; i++) {
					if (get.color(evt.cards2[i], player) == 'red') {
						event.count++;
					}
				}
				event.goto(1);
			}
			if (player.countMark('yb037_kexie') >= 2) {
				for (let i = 0; i < evt.cards2.length; i++) {
					if (evt.cards2[i].suit == 'heart') {
						event.count++;
					}
				}
				event.goto(1);
			}
			('step 1');
			player.loseHp(event.count);
		},
	},
	yb037_guiling: {
		trigger: { player: 'damageBegin4' },
		forced: true,
		audio: 'ext:夜白神略/audio/character:2',
		filter(event, player) {
			if (player.getEquip(2)) {
				return false;
			}
			if (event.num <= 1) {
				return false;
			}
			if (player.hasSkillTag('unequip2')) {
				return false;
			}
			if (
				event.source &&
				event.source.hasSkillTag('unequip', false, {
					name: event.card ? event.card.name : null,
					target: player,
					card: event.card,
				})
			) {
				return false;
			}
			return true;
		},
		content() {
			trigger.num = 1;
		},
		group: ['yb037_guiling_1', 'yb037_guiling_2'],
		subSkill: {
			1: {
				audio: 'ext:夜白神略/audio/character:2',
				trigger: { player: ['dyingAfter'] },
				forced: true,
				filter(event, player) {
					if (!player.hasSkill('yb037_kexie')) {
						return false;
					}
					return true;
				},
				content() {
					if (player.countMark('yb037_kexie') < 2) {
						player.addMark('yb037_kexie');
					} else {
						player.removeSkill('yb037_kexie');
					}
				},
			},
			2: {
				audio: 'ext:夜白神略/audio/character:2',
				trigger: { player: ['dying'] },
				filter(event, player) {
					return event.getParent(2) && event.getParent(2).name == 'yb037_kexie';
				},
				forced: true,
				content() {
					if (player.maxHp > 3) {
						player.loseMaxHp();
					}
					if (player.hp < 1) {
						player.hp = player.maxHp;
					}
				},
			},
		},
		ai: {
			filterDamage: true,
			skillTagFilter(player, tag, arg) {
				if (player.hasSkillTag('unequip2')) {
					return false;
				}
				if (arg && arg.player) {
					if (
						arg.player.hasSkillTag('unequip', false, {
							name: arg.card ? arg.card.name : null,
							target: player,
							card: arg.card,
						})
					) {
						return false;
					}
					if (
						arg.player.hasSkillTag('unequip', false, {
							name: arg.card ? arg.card.name : null,
							target: player,
							card: arg.card,
						})
					) {
						return false;
					}
					if (arg && arg.player.hasSkillTag('jueqing', false, player)) {
						return false;
					}
				}
			},
			effect: {
				target(card, player, target) {
					if (player == target && get.subtype(card) == 'equip2') {
						if (get.equipValue(card) <= 8) {
							return 0;
						}
					}
					if (target.getEquip(2)) {
						return;
					}
				},
			},
		},
	},
	yb037_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb038_quanlu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCard',
		},
		mark: true,
		marktext: '泉',
		intro: {
			name: '泉路',
			content(storage, player, skill) {
				let str = '本技能累积次数<li>';
				str += player.storage.yb038_quanlu;
				str += '<br/>因此技能失去体力<li>';
				str += get.translation(player.storage.ybsl_quan);
				str += '<br/>因此技能失去上限<li>';
				str += get.translation(player.storage.ybsl_lu);
				return str;
			},
		},
		init(player, skill) {
			player.storage.ybsl_quan = 0;
			player.storage.ybsl_lu = 0;
		},

		forced: true,
		content() {
			'step 0';
			player.chooseToDiscard(1, 'h', true).set('prompt', '请选择弃置一张手牌');
			('step 1');
			if (player.countCards('h') == 0) {
				let list = ['掉血', '掉上限'];
				if (player.maxHp == player.hp) {
					list.remove('掉上限');
				}
				player
					.chooseControl(list)
					.set('prompt2', '请选择失去1点体力<span class=yellowtext>或</span>体力上限')
					.set('ai', function (player) {
						if (player.hp > 2 || player.hp == player.maxHp) {
							return '掉血';
						}
						return '掉上限';
					});
			}
			('step 2');
			if (result.control == '掉血') {
				player.loseHp(1);
				event.kk = true;
				player.storage.ybsl_quan++;
			} else if (result.control == '掉上限') {
				player.loseMaxHp(1);
				event.kk = true;
				player.storage.ybsl_lu++;
			}
			('step 3');
			if (event.kk == true) {
				let n = player.maxHp;
				if (n > 5) {
					n = 5;
				}
				player.draw(n);
				if (player.hasSkill('yb038_quanlu')) {
					player.addMark('yb038_quanlu');
				}
			}
		},
	},
	yb038_wangyuan: {
		audio: 'yb038_shenglu',
		trigger: {
			player: 'phaseJieshuAfter',
		},
		forced: true,
		filter(event, player) {
			return player.storage.ybsl_quan > 0 || player.storage.ybsl_lu > 0;
		},
		content() {
			'step 0';
			const quan = player.storage.ybsl_quan;
			const lu = player.storage.ybsl_lu;
			player.recover(player.storage.ybsl_quan);
			player.gainMaxHp(player.storage.ybsl_lu);
			('step 1');
			player.storage.ybsl_quan = 0;
			player.storage.ybsl_lu = 0;
			game.log(player, '归还了', quan, '点体力和', lu, '点体力上限');
			('step 2');
			if (player.countMark('yb038_quanlu') >= 3) {
				player.removeMark('yb038_quanlu', 3);
				player.gainMaxHp();
			}
		},
	},
	yb038_shenglu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCard',
		},
		forced: true,
		content() {
			'step 0';
			player
				.chooseToDiscard(1, 'he')
				.set('prompt2', '生路:是否弃置一张牌')
				.set('ai', function (card) {
					return 2 - get.value(card);
				});
			('step 1');
			if (player.countCards('h') == 0) {
				let list = ['掉血加上限', '掉上限回血'];
				if (player.maxHp == player.hp) {
					list.remove('掉上限回血');
				}
				player
					.chooseControl(list)
					.set('prompt2', '请选择失去1点体力并增加1点体力上限<span class=yellowtext>或</span>失去1点体力上限并回复1点体力')
					.set('ai', function (player) {
						if (player.hp > 2 || player.hp == player.maxHp) {
							return '掉血加上限';
						}
						return '掉上限回血';
					});
			}
			('step 2');
			if (result.control == '掉血加上限') {
				player.loseHp();
				player.gainMaxHp();
				event.kk = true;
			} else if (result.control == '掉上限回血') {
				player.loseMaxHp();
				player.recover();
				event.kk = true;
			}
			('step 3');
			if (event.kk == true) {
				let n = player.maxHp;
				if (n > 5) {
					n = 5;
				}
				player.draw(n);
			}
		},
	},
	yb038_fusheng: {
		juexingji: true,
		audio: 'ext:夜白神略/audio/character:2',
		derivation: ['yb038_shenglu', 'yb038_enxu'],
		trigger: {
			player: 'dying',
		},
		forced: true,
		filter(event, player) {
			return !player.storage.yb038_fusheng;
		},
		content() {
			'step 0';
			player.storage.yb038_fusheng = true;
			player.awakenSkill('yb038_fusheng');
			player.addSkill('yb038_fusheng_die');
			('step 1');
			let k = Math.abs(player.countMark('yb038_quanlu') - 2);
			if (player.countMark('yb038_quanlu') >= 3) {
				player.gainMaxHp(k + 1);
			} else {
				player.loseMaxHp(k);
			}
			event.k = player.countMark('yb038_quanlu') - 2;
			if (event.k < 1) {
				event.k = 1;
			}
			('step 2');
			player.recover(event.k);
			('step 3');
			player.removeSkill('yb038_quanlu');
			player.addSkill('yb038_shenglu');
			player.addSkill('yb038_enxu');
		},
		subSkill: {
			die: {
				forced: true,
				forceDie: true,
				trigger: {
					player: 'die',
				},
				filter(event, player) {
					return true;
				},
				content: async function (event, trigger, player) {
					await player.removeSkill('yb038_fusheng_die');
					if (!player.isAlive()) {
						const result = await player
							.chooseTarget('请选择一名其他角色获得【生路】', lib.filter.notMe)
							.set('ai', function (target) {
								return get.attitude(_status.event.player, target);
							})
							.forResult();
						if (result.targets) {
							let target = result.targets[0];
							target.addSkill('yb038_shenglu');
						}
					}
				},
			},
		},
	},
	yb038_fushengxx: {
		juexingji: true,
		audio: 'ext:夜白神略/audio/character:2',
		derivation: ['yb038_wangyuan', 'yb038_enxu', 'yb038_shenglu'],
		trigger: {
			player: 'dying',
		},
		forced: true,
		filter(event, player) {
			return !player.storage.yb038_fushengxx;
		},
		content() {
			'step 0';
			player.storage.yb038_fushengxx = true;
			player.awakenSkill('yb038_fushengxx');
			player.addSkill('yb038_fusheng_die');
			('step 1');
			const quan = player.storage.ybsl_quan;
			const lu = player.storage.ybsl_lu;
			player.gainMaxHp(player.storage.ybsl_lu);
			player.recover(player.storage.ybsl_quan);
			game.log(player, '归还了', quan, '点体力和', lu, '点体力上限');
			('step 2');
			player.storage.ybsl_quan = 0;
			player.storage.ybsl_lu = 0;
			player.gainMaxHp(2);
			('step 3');
			player.addSkill('yb038_wangyuan');
			player.addSkill('yb038_enxu');
			player.removeMark('yb038_quanlu', player.storage.yb038_quanlu);
		},
	},
	yb038_enxu: {
		groupSkill: true,
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		filterCard: true,
		usable: 1,
		selectCard: 0,
		filter(event, player) {
			return player.group == 'YB_memory';
		},
		filterTarget(card, player, target) {
			if (!target.hasSex('male')) {
				return false;
			}
			if (target == player) {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			let n = player.maxHp;
			if (n > 6) {
				n = 6;
			}
			player.loseMaxHp(2);
			target.draw(n);
			('step 1');
			const c = Math.abs(player.hp - target.hp);
			if (c > 0) {
				player.hp > target.hp ? target.recover(c) : player.recover(c);
			}
		},
		ai: {
			order: 3.5,
			result: {
				player(player) {
					if (player.maxHp >= 6) {
						return 4;
					}
					return -1;
				},
				target: 4,
			},
			threaten: 1.7,
			expose: 0.4,
		},
	},
	yb038_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb038_youhun: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb038_chameng: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: ['loseAfter', 'gainAfter'],
		},
		filter(event, player, name) {
			if (!event.player || !event.player.isAlive()) {
				return false;
			}
			if (name == 'loseAfter') {
				let evt = event.getParent('phaseDiscard');
				if (evt && evt.name == 'phaseDiscard') {
					return false;
				}
				if (event.type == 'discard') {
					return true;
				}
				return false;
			} else {
				let evt = event.getParent('phaseDraw');
				if (evt && evt.name == 'phaseDraw') {
					return false;
				}
				if (event.parent.name == 'draw') {
					return true;
				}
				return false;
			}
		},
		usable: 1,
		check(event, player) {
			let numa = event.name == 'lose' ? -1 : 1;
			let numb = get.attitude(player, event.player);
			return numa * numb > 0;
		},
		prompt2(event, player) {
			let str = get.translation(event.player);
			let numb = event.num || event.cards.length;
			let str2;
			if (event.name == 'lose') {
				str += '刚才弃了';
				str2 = event.player.isTurnedOver() ? '再弃' + get.cnNumber(numb) + '张牌？' : '翻面？';
			}
			if (event.name == 'gain') {
				str += '刚才摸了';
				str2 = !event.player.isTurnedOver() ? '再摸' + get.cnNumber(numb) + '张牌？' : '翻回？';
			}
			str += get.cnNumber(numb) + '张牌,是否令其' + str2;
			return str;
		},
		content() {
			if (event.triggername == 'loseAfter') {
				if (trigger.player.isTurnedOver()) {
					trigger.player.chooseToDiscard('he', trigger.num, true);
				} else {
					trigger.player.turnOver(true);
				}
			} else {
				if (trigger.player.isTurnedOver()) {
					trigger.player.turnOver(false);
				} else {
					trigger.player.draw(trigger.cards.length);
				}
			}
		},
	},

	yb039_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},
	yb039_zhifu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterCard(card, player) {
			const suit = card.suit;
			if (Array.isArray(ui.selected.cards)) {
				for (const i of ui.selected.cards) {
					if (i.suit == suit) {
						return false;
					}
				}
			}
			return true;
		},
		selectCard: 1,
		check(card) {
			if (card.suit == 'heart') {
				return 8 - get.value(card);
			}
			if (card.suit == 'diamond') {
				return 8 - get.value(card);
			}
			return 6 - get.value(card);
		},
		content() {
			'step 0';
			event.list = [cards[0].suit, get.type2(cards[0]), cards[0].number];
			('step 1');
			let nature, num, select;
			switch (event.list[0]) {
				case 'spade':
					nature = 'thunder';
					break;
				case 'heart':
					nature = 'recover';
					break;
				case 'club':
					nature = 'ice';
					break;
				case 'diamond':
					nature = 'fire';
					break;
				default:
					nature = 'kami';
					break;
			}
			let numb = Math.floor(Math.random() * 13) <= event.list[2] ? [2, 3] : [1, 1];
			if (get.isLuckyStar(player)) {
				numb = [2, 3];
			}
			switch (event.list[1]) {
				case 'basic':
					num = 1;
					select = [1, 1];
					break;
				case 'trick':
					num = 1;
					select = [1, numb[1]];
					break;
				default:
					num = numb[0];
					select = [1, 1];
					break;
			}
			if (player.hasSkill('yb039_feiyan') && nature == 'fire') {
				Math.random() * 2 > 1 ? num++ : select[1]++;
			}
			const cardx = 'ybsl_magic_' + nature + '_' + num + '_' + select[1];
			event.cardx = cardx;
			if (!lib.card[cardx]) {
				lib.card[cardx] = {
					audio: true,
					fullskin: true,
					type: 'ybsl_magicbook',
					enable: true,
					selectTarget: select,
					damagenum: num,
					damagenature: nature,
					content() {
						'step 0';
						let num = lib.card[event.card.name].damagenum || 1;
						event.baseDamage = num;
						let nature = lib.card[event.card.name].damagenature || 'recover';
						event.nature = nature;
						('step 1');
						if (event.nature == 'recover') {
							target.recover(event.baseDamage);
						} else {
							target.damage(event.baseDamage, event.nature);
						}
					},
					ai: {
						basic: {
							order() {
								return 11;
							},
							useful: [5, 1],
							value: 5,
						},
					},
				};
				if (lib.card[cardx].damagenature == 'recover') {
					lib.card[cardx].filterTarget = function (card, player, target) {
						return true;
					};
					lib.card[cardx].ai.result = {
						target(player, target) {
							return target.hp < target.maxHp ? 2 : 0;
						},
						tag: {
							recover: num,
							save: num,
						},
					};
				} else {
					lib.card[cardx].filterTarget = function (card, player, target) {
						return player != target;
					};
					lib.card[cardx].ai.result = {
						target(player, target) {
							return -2;
						},
						tag: {
							damage: true,
							natureDamage(card) {
								if (lib.card[card].damagenature) {
									return 1;
								}
							},
							fireDamage(card, nature) {
								if (lib.card[card].damagenature == 'fire') {
									return 1;
								}
							},
							thunderDamage(card, nature) {
								if (lib.card[card].damagenature == 'thunder') {
									return 1;
								}
							},
							iceDamage(card, nature) {
								if (lib.card[card].damagenature == 'ice') {
									return 1;
								}
							},
						},
					};
				}
				lib.translate[cardx + '_info'] = '出牌阶段,对' + (select[1] == 1 ? '一' : '至多' + get.cnNumber(select[1])) + '名' + (nature == 'recover' ? '' : '其他') + '角色使用,目标' + (nature == 'recover' ? '回复' : '受到') + get.cnNumber(num) + '点' + (nature == 'fire' ? '火属性伤害' : '') + (nature == 'thunder' ? '雷属性伤害' : '') + (nature == 'ice' ? '冰属性伤害' : '') + (nature == 'kami' ? '神属性伤害' : '') + '';
				lib.translate.recover = '愈';
				lib.translate.recover2 = '治愈';
				event.str = get.translation(nature) + get.cnNumber(select[1], true) + get.cnNumber(num, true);
				event.goto(2);
			} else {
				event.goto(4);
			}
			('step 2');
			player
				.FY_chooseText()
				.set('prompt', '请为这张牌命名<br>' + lib.translate[event.cardx + '_info'])
				.set('ai', function () {
					return event.str;
				});
			('step 3');
			lib.translate[event.cardx] = result.text;
			('step 4');
			let cardxx = game.YB_createCard(event.cardx, null, null, null);
			player.showCards(cardxx);
			player.gain(cardxx, 'gain2');
		},
		ai: {
			order: 8,
			result: {
				player: 1,
			},
		},
	},
	yb039_feiyan: {
		audio: 'ext:夜白神略/audio/character:2',
		charlotte: true,
		forced: true,
	},
	yb041_fuxin: {},
	yb041_qiancheng: {},

	yb042_sizhi: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'shizuku_sizhi',
	},
	yb042_mingtui: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			target: 'useCardToTarget',
		},
		filter(event, player) {
			if (event.card.number) {
				return true;
			}
		},
		check(event, player) {
			let num = 4;
			if (event.parent.excluded.includes(player)) {
				num /= 2;
			}
			if (get.attitude(player, event.player) > 0) {
				num *= 0;
			}
			num -= get.effect(player, { name: event.card.name }, event.player, player);
			return num > 0;
		},
		content() {
			'step 0';
			let numa = trigger.card.number + 1;
			player
				.chooseToDiscard([1, Infinity], 'he')
				.set('ai', function (card) {
					const player = _status.event.player;
					let numa = _status.event.numa;

					let num = 0;
					for (const i of ui.selected.cards) {
						num += i.number;
					}
					if (num >= numa) {
						return 0;
					}
					if (card.number + num >= numa) {
						return 15 - get.value(card);
					}
					if (!ui.selected.cards.length) {
						let min = _status.event.min;
						if (
							card.number < min &&
							!player.countCards('h', function (xcard) {
								return xcard != card && card.number + xcard.number > min;
							})
						) {
							return 0;
						}
						return card.number;
					}
					return Math.max(5 - get.value(card), card.number);
				})
				.set('prompt', '请选择要弃置的牌')
				.set('numa', numa)
				.set('min', trigger.card.number + 1)
				.set('prompt2', '选择的牌点数之和至少为' + (trigger.card.number + 1) + '方能抵挡');
			const func = function (id) {
				const dialog = get.idDialog(id);
				if (dialog) {
					dialog.content.firstChild.innerHTML = '请选择要弃置的牌';
				}
			};
			if (player == game.me) {
				func(event.videoId);
			} else if (player.isOnline()) {
				player.send(func, event.videoId);
			}
			('step 1');
			if (result.cards) {
				let numx = 0;
				for (const i of result.cards) {
					numx += i.number;
				}
				event.numx = numx;
				if (event.numx > trigger.card.number) {
					trigger.parent.excluded.add(player);
				}
			}
		},
	},
	yb042_lisheng: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { global: 'die' },
		forceDie: true,
		forced: true,
		filter(event, player) {
			if (player.isAlive()) {
				return true;
			} else {
				return event.player == player;
			}
		},
		content() {
			'step 0';
			if (trigger.player != player) {
				event.player = player;
			} else {
				player.chooseTarget(get.prompt2('yb042_lisheng'), lib.filter.notMe).set('ai', function (target) {
					return get.attitude(_status.event.player, target);
				});
			}
			('step 1');
			let tar;
			if (event.player.isAlive()) {
				tar = event.player;
			} else {
				tar = result.targets[0];
			}
			let cards = [];
			for (const i of lib.suit) {
				let card = get.cardPile2(function (card) {
					return card.suit == i;
				});
				if (card) {
					cards.push(card);
				}
			}
			if (tar) {
				if (cards.length) {
					tar.gain(cards, 'gain2');
				}
				tar.recover();
			}
		},
	},

	yb043_zhishi: {
		audio: 'ext:夜白神略/audio/character:2',
		audioname2: {
			ybsl_020jiayutong: 'yb020_zhishi',
			ybsl_046jiangxuewu: 'yb046_zhishi',
		},
		enable: 'chooseToUse',

		YB_shiji: 'yang',
		group: 'yb043_zhishi_2',
		filter(event, player) {
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}

			for (const i of Array.from(ui.discardPile.childNodes)) {
				const namea = i.name;

				if (evt(i, player, event) && !lib.skill.yb043_zhishi.getUsed(player).includes(namea)) {
					return true;
				}
			}
		},
		getUsed(player) {
			let list = [];
			player.getHistory('useCard', function (evt) {
				list.add(evt.card.name);
			});
			return list;
		},
		chooseButton: {
			dialog(event, player) {
				let cards = Array.from(ui.discardPile.childNodes);
				return ui.create.dialog(
					'知世',
					cards.filter(function (card) {
						return true;
					}),
					'hidden',
				);
			},
			filter(button, player) {
				let card = button.link;
				let name = card.name;
				if (lib.skill.yb043_zhishi.getUsed(player).includes(name)) {
					return false;
				}
				return _status.event.parent.filterCard({ name: card.name }, player, _status.event.parent);
			},
			backup(links, player) {
				return {
					audio: 'yb043_zhishi',

					selectCard: 0,

					discard: false,
					lose: false,
					filterCard() {
						return true;
					},
					viewAs: {
						name: links[0].name,
						nature: links[0].nature,
					},
					card: links[0],
					precontent() {
						const cardv = lib.skill.yb043_zhishi_backup.card;
						event.result.cards = cardv;
					},
				};
			},
			prompt(links, player) {
				return `知世:选择 ${get.translation(links[0])}的目标`;
			},
		},
		hiddenCard(player, name) {
			for (const i of Array.from(ui.discardPile.childNodes)) {
				const namea = i.name;

				if (name == namea && !lib.skill.yb043_zhishi.getUsed(player).includes(namea)) {
					return true;
				}
			}
		},
		subSkill: {
			2: {
				trigger: {
					player: ['useCardAfter'],
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter(event, player) {
					return event.skill == 'yb043_zhishi_backup';
				},
				content() { },
			},
			backup: {},
		},
		ai: {
			order: 10,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
	},
	yb043_shuhai: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',

		YB_shiji: 'yin',
		filter(event, player) {
			if (player.countCards('h') < 2) {
				return false;
			}
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			for (const i of lib.inpile) {
				const type = get.type(i);

				if (type == 'trick' && evt({ name: i }, player, event) && !lib.skill.yb043_zhishi.getUsed(player).includes(i)) {
					return true;
				}
			}
			return false;
		},
		group: 'yb043_shuhai_2',
		chooseButton: {
			dialog(event, player) {
				let list = [];
				for (let i = 0; i < lib.inpile.length; i++) {
					if (get.type(lib.inpile[i]) == 'trick') {
						list.push(['锦囊', '', lib.inpile[i]]);
					}
				}
				return ui.create.dialog('贤者', [list, 'vcard']);
			},
			filter(button, player) {
				let card = button.link;
				let name = button.link[2];
				if (lib.skill.yb043_zhishi.getUsed(player).includes(name)) {
					return false;
				}
				return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
			},
			check(button) {
				if (_status.event.parent.type != 'phase') {
					return 1;
				}
				const player = _status.event.player;
				if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan_gai', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) {
					return 0;
				}
				return player.getUseValue({
					name: button.link[2],
					nature: button.link[3],
				});
			},
			backup(links, player) {
				return {
					audio: 'yb043_shuhai',

					filterCard: true,
					selectCard: 2,
					complexCard: true,
					position: 'h',
					popname: true,
					viewAs: { name: links[0][2] },
					precontent() { },
				};
			},
			prompt(links, player) {
				return '将两张手牌当作' + get.translation(links[0][2]) + '使用';
			},
		},
		hiddenCard(player, name) {
			const type = get.type(name);

			if (lib.skill.yb043_zhishi.getUsed(player).includes(name)) {
				return false;
			}
			return type == 'trick' && player.countCards('h') >= 2;
		},
		ai: {
			fireAttack: true,
			respondSha: true,
			respondShan: true,
			skillTagFilter(player) {
				if (player.countCards('h') < 2) {
					return false;
				}
			},
			threaten: 1.2,
			order: 10,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
		subSkill: {
			2: {
				trigger: {
					player: ['useCardAfter'],
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter(event, player) {
					return event.skill == 'yb043_shuhai_backup';
				},
				content() { },
			},
			backup: {},
		},
	},

	yb046_zhishi: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb046_xuewu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		filter(event, player) {
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			if (Array.from(ui.discardPile.childNodes).length <= 0) {
				return false;
			}
			for (const i of lib.inpile) {
				const type = get.type(i);
				if (type == 'basic' && evt({ name: i }, player, event)) {
					return true;
				}
			}
			return false;
		},
		hiddenCard(player, name) {
			const type = get.type(name);
			return type == 'basic' && player.countCards('h') >= 1;
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];
				let nature = null;
				for (let i = 0; i < lib.inpile.length; i++) {
					if (get.type(lib.inpile[i]) == 'basic') {
						list.push(['基本', '', lib.inpile[i]]);
						if (lib.inpile[i] == 'sha') {
							for (let k of get.YB_natureList()) {
								k = get.YB_nature(k);
								list.push(['基本', '', lib.inpile[i], k]);
							}
						}
					}
				}
				return ui.create.dialog('雪舞', [list, 'vcard']);
			},
			filter(button, player) {
				return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
			},
			check(button) {
				if (_status.event.parent.type != 'phase') {
					return 1;
				}
				const player = _status.event.player;
				return player.getUseValue({
					name: button.link[2],
					nature: button.link[3],
				});
			},
			backup(links, player) {
				return {
					filterCard(card, player) {
						let cards = Array.from(ui.discardPile.childNodes);
						const cardx = cards[cards.length - 1];

						return card.suit == cardx.suit;
					},
					selectCard: 1,
					complexCard: true,
					position: 'h',
					audio: 'yb046_xuewu',
					popname: true,
					viewAs: { name: links[0][2], nature: links[0][3] },

					prompt(links, player) {
						let cards = Array.from(ui.discardPile.childNodes);
						const cardx = cards[cards.length - 1];
						return '将一张' + get.translation(cardx.suit) + '手牌当作' + (links[0][3] == null) ? '' : get.translation(links[0][3]) + get.translation(links[0][2]) + '使用';
					},
				};
			},
		},
		ai: {
			fireAttack: true,
			respondSha: true,
			respondShan: true,
			save: true,

			order: 4,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
	},
	yb046_qingxue: {
		audio: 'ext:夜白神略/audio/character:2',
		YB_shiji: 'yin',
		name: '清雪',
		trigger: {
			source: 'damageSource',
			player: 'damageEnd',
		},
		filter(event, player) {
			if (event._notrigger.includes(event.player)) {
				return false;
			}
			if (event.source == event.player) {
				return false;
			}
			if (event.player == player) {
				let target = event.source;
			} else {
				let target = event.player;
			}
			return event.num && target.isIn() && player.isIn();
		},
		check(event, player) {
			if (event.player == player) {
				let target = event.source;
			} else {
				let target = event.player;
			}

			return true;
		},
		logTarget(event, player) {
			if (event.player == player) {
				return event.source;
			}
			return event.player;
		},
		content: async function (event, trigger, player) {
			if (trigger.player == player) {
				let target = trigger.source;
			} else {
				let target = trigger.player;
			}
			if (target.countDiscardableCards(player, 'he')) {
				const result = await player
					.discardPlayerCard('he', target, [1, 2])
					.set('ai', function (button) {
						let att = get.attitude(player, target);
						if (att >= 0) {
							return false;
						}
						return get.value(button.link) > 5;
					})
					.forResult();
			}
			let num = 2;
			if (result?.cards) {
				let list = get.YB_suit(result.cards);
				num -= list.length;
				await target.draw(list.length);
			}
			if (num > 0) {
				await player.draw(num);
			}
		},
		subSkill: {
			yb: {
				name: '清雪',
			},
		},
	},

	yb047_youhun: {
		audio: 'ext:夜白神略/audio/character:2',
		audioname2: {
			ybsl_038bianqiuwen: 'yb038_youhun',
		},
		enable: 'chooseToUse',
		zhuanhuanji: true,
		mark: true,
		intro: {
			content(storage, player) {
				let str = storage ? '你可以将X+Y张牌当作任意一张基本使用' : '你可以将X+Y张牌当作任意一张普通锦囊牌使用';
				str += '<br>(X为本轮此技能使用次数且至少为0,Y为本局游戏内以此法增加的体力上限数,且至少为0)';
				return str;
			},
		},
		marktext: '☯',
		init(player) {
			player.storage.yb047_youhun = false;
		},
		hiddenCard(player, name) {
			const type = get.type(name);
			if (player.storage.yb047_youhun) {
				return type == 'basic';
			}
			return type == 'trick';
		},
		filter(event, player) {
			const type = player.storage.yb047_youhun ? 'basic' : 'trick';
			for (let name of lib.inpile) {
				if (get.type(name) != type) {
					continue;
				}
				if (event.filterCard && event.filterCard({ name: name }, player, event)) {
					return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				const dialog = ui.create.dialog('游魂', 'hidden');
				const type = player.storage.yb047_youhun ? 'basic' : 'trick';
				let list = [];
				for (let name of lib.inpile) {
					if (get.type(name) != type) {
						continue;
					}
					if (event.filterCard && event.filterCard({ name: name }, player, event)) {
						list.push([type, '', name]);
						if (name == 'sha') {
							for (let j of get.YB_natureList()) {
								j = get.YB_nature(j);
								list.push([type, '', name, j]);
							}
						}
					}
				}
				dialog.add([list, 'vcard']);
				return dialog;
			},
			filter(button) {
				if (ui.selected.buttons.length && typeof button.link == typeof ui.selected.buttons[0].link) {
					return false;
				}
				return true;
			},
			select() {
				return 1;
			},
			check(button) {
				const player = _status.event.player;
				if (typeof button.link == 'number') {
					let card = player.getEquip(button.link);
					if (card) {
						let val = get.value(card);
						if (val > 0) {
							return 0;
						}
						return 5 - val;
					}
					switch (button.link) {
						case 3:
							return 4.5;
						case 4:
							return 4.4;
						case 5:
							return 4.3;
						case 2:
							return (3 - player.hp) * 1.5;
						case 1: {
							if (
								game.hasPlayer(function (current) {
									return (get.realAttitude || get.attitude)(player, current) < 0 && get.distance(player, current) > 1;
								})
							) {
								return 0;
							}
							return 3.2;
						}
					}
				}
				let name = button.link[2];
				let evt = _status.event.parent;
				if (get.type(name) == 'basic') {
					if (name == 'shan') {
						return 2;
					}
					if (evt.type == 'dying') {
						if (get.attitude(player, evt.dying) < 2) {
							return false;
						}
						if (name == 'jiu') {
							return 2.1;
						}
						return 1.9;
					}
					if (evt.type == 'phase') {
						return player.getUseValue({ name: name, nature: button.link[3] });
					}
					return 1;
				}
				if (!['chuqibuyi', 'shuiyanqijunx', 'juedou', 'nanman', 'wanjian', 'shunshou', 'zhujinqiyuan'].includes(name)) {
					return 0;
				}
				let card = { name: name };
				if (['shunshou', 'zhujinqiyuan'].includes(card.name)) {
					if (
						!game.hasPlayer(function (current) {
							return get.attitude(player, current) != 0 && get.distance(player, current) <= 1 && player.canUse(card, current) && get.effect(current, card, player, player) > 0;
						})
					) {
						return 0;
					}
					return player.getUseValue(card) - 7;
				}
				return player.getUseValue(card) - 4;
			},
			backup(links, player) {
				return {
					audio: 'yb047_youhun',
					filterCard() {
						return true;
					},
					selectCard() {
						let numa = 0;
						if (player.countMark('yb047_youhun_round') > 0) {
							numa = player.countMark('yb047_youhun_round');
						}
						let numb = 0;
						if (player.countMark('yb047_youhun_maxHp') > 0) {
							numb = player.countMark('yb047_youhun_maxHp');
						}
						return numa + numb;
					},
					viewAs: {
						name: links[0][2],
						nature: links[0][3],
					},
					position: 'hes',
					popname: true,
					precontent() {
						player.addTempSkill('yb047_youhun_round', 'roundStart');
						player.addMark('yb047_youhun_round');
						player.changeZhuanhuanji('yb047_youhun');
						player.markSkill('yb047_youhun_maxHp');
					},
				};
			},
			prompt(links, player) {
				let name = links[0][2];
				let nature = links[0][3];
				let str = '视为使用一张' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]);
				let numa = 0;
				if (player.countMark('yb047_youhun_round') > 0) {
					numa = player.countMark('yb047_youhun_round');
				}
				let numb = 0;
				if (player.countMark('yb047_youhun_maxHp') > 0) {
					numb = player.countMark('yb047_youhun_maxHp');
				}
				if (numa + numb > 0) {
					let str = '将' + get.cnNumber(numa + numb) + '张牌当作' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
				}
				return str;
			},
		},
		ai: {
			respondSha: true,
			respondShan: true,
			skillTagFilter(player, tag, arg) {
				if (arg == 'respond') {
					return false;
				}
				if (!player.storage.yb047_youhun || player.hasSkill('yb047_youhun_true')) {
					return false;
				}
			},
			order: 1,
			result: {
				player: 1,
			},
		},
		group: ['yb047_youhun_damage', 'yb047_youhun_maxHp'],
		subSkill: {
			round: {
				charlotte: true,
			},
			maxHp: {
				charlotte: true,
				mark: true,
				marktext: '魂',
				intro: {
					content(storage, player) {
						let str = '当前X值为';
						let numa = 0;
						if (player.countMark('yb047_youhun_round') > 0) {
							numa = player.countMark('yb047_youhun_round');
						}
						str += numa;
						str += ',Y值为';
						let numb = 0;
						if (player.countMark('yb047_youhun_maxHp') > 0) {
							numb = player.countMark('yb047_youhun_maxHp');
						}
						str += numb;
						str += '';
						return str;
					},
				},
				forced: true,
				trigger: {
					player: 'disableEquipAfter',
				},
				content() {
					if (player.countMark('yb047_youhun_maxHp') > 0) {
						player.removeMark('yb047_youhun_maxHp');
						game.log(player, '令', '#y游魂', '的Y计数-1');
					}
				},
			},
			damage: {
				charlotte: true,
				trigger: { source: 'damageSource' },
				forced: true,
				filter(event, player) {
					return event.parent.skill == 'yb047_youhun_backup';
				},
				content() {
					player.gainMaxHp();
					player.addMark('yb047_youhun_maxHp');
					game.log(player, '令', '#y游魂', '的Y计数+1');
				},
			},
		},
	},
	yb047_wanxin: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { global: 'phaseEnd' },
		hasHistory(player) {
			return player.getHistory('damage').length;
		},
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return lib.skill.yb047_wanxin.hasHistory(current);
			});
		},
		forced: true,
		content() {
			'step 0';
			player
				.chooseTarget(get.prompt2('yb047_wanxin'), function (card, player, target) {
					return _status.event.yuus.includes(target);
				})
				.set(
					'yuus',
					game.filterPlayer(function (current) {
						return lib.skill.yb047_wanxin.hasHistory(current);
					}),
				)
				.set('ai', function (target) {
					return get.attitude(_status.event.player, target);
				});
			('step 1');
			if (result.bool) {
				let target = result.targets[0];
				event.target = target;
				target.draw(2);
			} else {
				event.finish();
			}
			('step 2');
			player.turnOver(false);
			('step 3');
			player.link(false);
			if (target == player) {
				event.finish();
			}
			('step 4');
			target.turnOver(false);
			('step 5');
			target.link(false);
		},
	},
	yb047_shouqing: {
		audio: 'ext:夜白神略/audio/character:2',
		global: 'yb047_shouqing2',
	},
	yb047_shouqing2: {
		enable: 'phaseUse',
		viewAs() {
			return { name: 'tao' };
		},
		filterCard: { name: 'tao' },
		ignoreMod: true,
		filterTarget(card, player, target) {
			return target != player && target.isDamaged() && target.hasSkill('yb047_shouqing');
		},
		selectTarget() {
			return game.countPlayer(function (current) {
				return lib.skill.yb047_shouqing2.filterTarget(null, _status.event.player, current);
			}) > 1
				? 1
				: -1;
		},
		filter(event, player) {
			return (
				player.countCards('hs', 'tao') &&
				game.hasPlayer(function (current) {
					return lib.skill.yb047_shouqing2.filterTarget(null, player, current);
				})
			);
		},
		position: 'hs',
		onuse(links, player) {
			player.addSkill('yb047_shouqing3');
			player.addMark('yb047_shouqing3', 1, false);
		},
		prompt() {
			let list = game.filterPlayer(function (current) {
				return lib.skill.yb047_shouqing2.filterTarget(null, _status.event.player, current);
			});
			let str = '对' + get.translation(list);
			if (list.length > 1) {
				str += '中的一名角色';
			}
			str += '使用一张【桃】';
			return str;
		},
	},
	yb047_shouqing3: {
		intro: {
			content: '手牌上限+#',
		},
		mod: {
			maxHandcard(player, num) {
				return num + player.countMark('yb047_shouqing3');
			},
		},
		trigger: { player: 'useCardAfter' },
		forced: true,
		popup: false,
		filter(event, player) {
			return event.skill == 'yb047_shouqing2';
		},
		content() {
			player.draw();
		},
	},

	yb048_ningyuan: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'phaseDiscardBegin' },
		forced: true,
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		content() {
			'step 0';
			player.chooseCard('h', get.prompt('yb048_ningyuan'), [1, 5], '将至多五张手牌置于武将牌上作为<元>').set('ai', function (card) {
				if (ui.selected.cards.length >= player.needsToDiscard()) {
					return 6 - get.value(card);
				}
				return 100 - get.useful(card);
			});
			('step 1');
			if (result.bool) {
				let cards = result.cards;
				player.addToExpansion(cards, player, 'give').gaintag.add('yb048_ningyuan');
			}
		},
		marktext: '元',
		intro: {
			content: 'expansion',
			markcount: 'expansion',
		},
		onremove(player, skill) {
			let cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
		},
		group: ['yb048_ningyuan_use', 'yb048_ningyuan_discard'],
		subSkill: {
			use: {
				audio: 'yb048_ningyuan',
				trigger: { player: 'useCard' },
				forced: true,
				filter(event, player) {
					return player.getExpansions('yb048_ningyuan').length;
				},
				content() {
					'step 0';
					let num = Math.min(5, player.isMaxHandcard(true) ? 1 : player.getExpansions('yb048_ningyuan').length);
					if (num > 0) {
						player.draw(num);
					}
					('step 1');
					let cards = player.getExpansions('yb048_ningyuan');
					if (cards.length) {
						player.chooseButton(['选择移去一张<旋>', cards], true);
					} else {
						event.finish();
					}
					('step 2');
					if (result.bool) {
						player.loseToDiscardpile(result.links);
					}
				},
			},
			discard: {},
		},
	},
	yb048_wuling: {
		audio: 'ext:夜白神略/audio/character:2',
		group: 'yb004_wunv',
		derivation: ['yb004_wunv'],
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		filterCard: true,
		selectCard() {
			if (ui.selected.targets.length) {
				return [1, ui.selected.targets[0].countCards('he')];
			}
			return [1, Infinity];
		},
		filterTarget(event, player, target) {
			return target != player && target.countCards('he') >= Math.max(1, ui.selected.cards.length);
		},
		check(card) {
			if (
				!game.hasPlayer(function (current) {
					return current != _status.event.player && get.attitude(_status.event.player, current) < 0 && current.countCards('he') > ui.selected.cards.length;
				})
			) {
				return 0;
			}
			return 6 - get.value(card);
		},
		content() {
			'step 0';
			event.cardsx = cards.slice(0);
			let num = get.cnNumber(cards.length);
			const trans = get.translation(player);
			let prompt = '弃置' + num + '张牌,然后' + trans + '摸一张牌';
			if (cards.length > 1) {
				prompt += ';或弃置一张牌,然后' + trans + '摸' + num + '张牌';
			}
			const next = target.chooseToDiscard(prompt, 'he', true);
			next.numx = cards.length;
			next.selectCard = function () {
				if (ui.selected.cards.length > 1) {
					return _status.event.numx;
				}
				return [1, _status.event.numx];
			};
			next.complexCard = true;
			next.ai = function (card) {
				if (
					ui.selected.cards.length == 0 ||
					_status.event.player.countCards('he', function (cardxq) {
						return get.value(cardxq) < 7;
					}) >= _status.event.numx
				) {
					return 7 - get.value(card);
				}
				return -1;
			};
			('step 1');
			if (result.bool) {
				if (result.cards.length == cards.length) {
					player.draw();
				} else {
					player.draw(cards.length);
				}
				event.cardsx.addArray(result.cards);
				for (let i = 0; i < event.cardsx.length; i++) {
					if (get.position(event.cardsx[i]) != 'd') {
						event.cardsx.splice(i--, 1);
					}
				}
			} else {
				event.finish();
			}
			('step 2');
			if (event.cardsx.length) {
				player.chooseButton(['请按顺序将卡牌置于牌堆顶(先选择的在上)', event.cardsx], true, event.cardsx.length);
			} else {
				event.finish();
			}
			('step 3');
			if (result.bool) {
				event.cardsxx = result.links;
				if (player.hasSkill('yb048_ningyuan')) {
					player.chooseControl('是', 'cancel2').set('prompt', '是否将这些牌置于武将牌上充入凝元？');
				} else {
					event.goto(6);
				}
			}
			('step 4');
			if (result.control != '是') {
				event.goto(6);
			}
			('step 5');
			delete event.cardxx;
			let cards = event.cardsxx;
			player.addToExpansion(cards, player, 'give').gaintag.add('yb048_ningyuan');
			event.finish();
			('step 6');
			if (event.cardsxx) {
				while (event.cardsxx.length) {
					let card = event.cardsxx.pop();
					card.fix();
					ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
				}
			}
			event.finish();
		},
		ai: {
			threaten: 3,
			expose: 1,
			order: 10,
			result: {
				target: -1,
			},
		},
	},
	yb048_huanjie: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'key_huanjie',
	},
	yb048_zhimeng: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: 'judgeEnd',
			player: 'phaseDrawBegin2',
		},
		preHidden: true,
		filter(event, player, name) {
			if (name == 'phaseDrawBegin2') {
				return player.getExpansions('yb048_zhimeng');
			} else {
				return get.position(event.result.card, true) == 'o';
			}
		},
		content() {
			if (event.triggername == 'phaseDrawBegin2') {
				let cards = player.getExpansions('yb048_zhimeng');
				let list = [];
				for (const i of cards) {
					list.add(i.suit);
				}
				trigger.num += list.length;
			} else {
				player.addToExpansion(trigger.result.card, 'gain2').gaintag.add('yb048_zhimeng');
			}
		},
		mark: true,
		intro: {
			markcount: 'expansion',
			mark(dialog, content, player) {
				content = player.getExpansions('yb048_zhimeng');
				if (content && content.length) {
					dialog.addAuto(content);
				}
			},
			content(content, player) {
				content = player.getExpansions('yb048_zhimeng');
				if (content && content.length) {
					return get.translation(content);
				}
			},
		},
		mod: {
			maxHandcard(player, num) {
				let cards = player.getExpansions('yb048_zhimeng');
				let list = [];
				for (const i of cards) {
					list.add(i.suit);
				}
				return num + list.length;
			},
		},
	},
	yb048_shennv: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: { player: 'useCard' },
		content() {
			'step 0';
			player.judge('神女', function (card) {
				if (card.suit == trigger.card.suit) {
					if (!get.tag(trigger.card, 'norepeat')) {
						return 2;
					}
					return -1;
				}
				return 0;
			});
			('step 1');
			if (result.judge != 0) {
				trigger.effectCount++;
			}
		},
	},
	yb048_minzhen: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: 'phaseBegin',
		},
		filter(event, player) {
			if (!player.getExpansions('yb048_zhimeng')) {
				return false;
			}
			let cards = player.getExpansions('yb048_zhimeng');
			if (cards.length >= event.player.maxHp) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			event.cards = player.getExpansions('yb048_zhimeng');
			event.num = trigger.player.maxHp;
			('step 1');
			player.chooseButton(event.num, ['罠阵:请选择' + event.num + '张牌', event.cards], true);
			('step 2');
			if (result.bool) {
				event.cardsx = result.links;
			}
			('step 3');
			if (event.cardsx.length) {
				player.chooseButton(['罠阵:请按顺序将卡牌置于牌堆顶(先选择的在上)', event.cardsx], true, event.cardsx.length);
			} else {
				event.finish();
			}
			('step 4');
			if (result.bool) {
				const cardsx = result.links;
				while (cardsx.length) {
					let card = cardsx.pop();
					card.fix();
					ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
				}
				game.updateRoundNumber();
			}
		},
	},

	yb049_rongxiao: {
		audio: 'ext:夜白神略/audio/character:2',
		limited: true,
		trigger: {
			player: ['damageEnd', 'recoverEnd'],
		},
		filter(event, player) {
			const discarded = ui.discardPile.childNodes;
			if (discarded.length) {
				for (const i of discarded) {
					if (get.type(i) == 'trick') {
						return true;
					}
				}
			}
			return false;
		},
		cost() {
			event.result = player
				.chooseTarget(1, get.prompt2('yb049_rongxiao'))
				.set('filterTarget', function (card, player, target) {
					return target != player && target.hp < player.hp;
				})
				.set('ai', function (target) {
					return get.attitude(player, target);
				})
				.forResult();
		},
		content() {
			'step 0';
			player.awakenSkill('yb049_rongxiao');
			('step 1');
			const discarded = ui.discardPile.childNodes;
			event.list = [];
			if (discarded.length) {
				for (const i of discarded) {
					if (get.type(i) == 'trick') {
						event.list.push(i);
					}
				}
			}
			if (event.list.length) {
				event.targets[0].chooseCardButton('选择一张获得之', event.list, true).set('ai', function (button) {
					return get.value(button.link);
				});
			}
			('step 2');
			if (result.bool && result.links) {
				const gaintag = [];
				gaintag.add('yb049_rongxiao');
				player.addSkill('yb049_rongxiao_use');
				event.targets[0].gain(result.links, 'gain2').gaintag.addArray(gaintag);
			}
		},
		subSkill: {
			use: {
				trigger: {
					global: ['useCardAfter'],
				},
				filter(event, player) {
					return event.player.hasHistory('lose', (evt) => evt.parent == event && Object.values(evt.gaintag_map).some((value) => value.includes('yb049_rongxiao'))) && !event.yb049_rongxiao;
				},
				popup: false,
				content() {
					let cards = trigger.cards;
					let card = trigger.card;
					trigger.yb049_rongxiao = true;
					if (player.hasUseTarget(card)) {
						player.chooseUseTarget(card, false);
					}
				},
			},
		},
	},
	yb049_fuhun: {
		audio: 'ext:夜白神略/audio/character:2',
		limited: true,
		trigger: {
			global: 'damageEnd',
		},
		filter(event, player) {
			return event.player.isIn() && event.source && event.source != event.player;
		},
		logTarget(event, player) {
			return event.player;
		},
		content() {
			'step 0';
			player.awakenSkill('yb049_fuhun');
			('step 1');
			player.addSkill('yb049_fuhun_use');
			const gaintag = ['yb049_fuhun'];
			trigger.player.draw(4).gaintag.addArray(gaintag);
		},
		subSkill: {
			use: {
				trigger: {
					global: ['loseAfter', 'loseAsyncAfter'],
				},
				popup: false,
				filter(event, player) {
					if (event.type != 'discard') {
						return false;
					}
					return (
						event.player.hasHistory('lose', (evt) => {
							if (evt != event && evt.parent != event) {
								return false;
							}
							event.cardsx = [];
							evt.cards.forEach((c) => {
								if (evt.gaintag_map[c.cardid] && evt.gaintag_map[c.cardid].includes('yb049_fuhun') && !event.cardsx.includes(c)) {
									event.cardsx.push(c);
								}
							});

							return event.cardsx.length;
						}) && !event.yb049_fuhun
					);
				},
				content() {
					'step 0';
					let cards = trigger.cardsx;
					trigger.yb049_fuhun = true;

					player.chooseButton(['选择一张使用之？', cards], 1).set('filterButton', function (button) {
						let cardxx = button.link;
						if (player.hasUseTarget(cardxx)) {
							return lib.filter.filterCard.apply(this, arguments);
						}
						return false;
					});

					('step 1');
					if (result.links) {
						let card = result.links[0];
						if (player.hasUseTarget(card)) {
							player.chooseUseTarget(card, false);
						}
					}
				},
			},
		},
	},
	yb049_zhongliu: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb052_chongji: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		filterTarget: lib.filter.notMe,
		selectTarget: 1,
		filterCard: true,

		selectCard() {
			const player = _status.event.player;
			let num = Math.min(player.hp, 5);
			return [1, num];
		},
		check(card) {
			const player = _status.event.player;
			if (ui.selected.cards && ui.selected.cards.length) {
				return 6 - get.value(card) && get.color(card) == get.color(ui.selected.cards[0]);
			}
			return 6 - get.value(card);
		},
		position: 'he',
		content: async function (event, trigger, player) {
			let cards = event.cards,
				target = event.target;
			let num = cards.length;
			const cards1 = [];
			cards1.push(Array.from(cards));
			if (target.countDiscardableCards(player, 'he')) {
				const relu = await player.discardPlayerCard('he', target, true, target.countDiscardableCards(player, 'he') > num ? num : target.countDiscardableCards(player, 'he')).forResult();
				if (relu.cards) {
					cards1.push(Array.from(relu.cards));
				}
			}
			if (get.YB_suit(cards1, 'color').length == 1) {
				await target.damage(num);
			}
		},
		ai: {
			order: 5,
			result: {
				target(player, target) {
					return get.damageEffect(target, player);
				},
			},
		},
	},

	yb053_lvxin: {
		subSkill: {
			hand: {
				charlotte: true,
				trigger: { global: 'phaseAfter' },
				silent: true,
				content() {
					player.storage.yb053_lvxin = 0;
					player.storage.yb053_lvxin_list = [];
					player.unmarkSkill('yb053_lvxin');
				},
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
		group: ['yb014_lvxin', 'yb053_lvxin_hand'],
		trigger: {
			player: 'gainEnd',
		},
		filter(event, player) {
			if (event.getParent(2) && event.getParent(2).name && event.getParent(2).name == 'yb014_lvxin') {
				return true;
			}
			return false;
		},
		check(event, player) {
			if (player.storage.yb053_lvxin_list) {
				return player.getDamagedHp() > 0 && !player.storage.yb053_lvxin_list.includes(get.type(event.card));
			}
			return player.getDamagedHp() > 0;
		},
		derivation: ['yb014_lvxin'],
		content() {
			'step 0';
			let list = [];
			if (player.getDamagedHp() > 0) {
				if (player.storage.yb053_lvxin_list) {
					if (!player.storage.yb053_lvxin_list.includes(get.type(trigger.cards[0]))) {
						list.push('回血');
					}
				} else {
					list.push('回血');
				}
			}
			list.push('加上限');
			list.push('cancel2');
			player.chooseControl(list).set('prompt', '是否弃置本次旅心摸的牌,然后回复1点体力或本回合手牌上限+1？');
			('step 1');
			if (result.control == '回血') {
				player.discard(trigger.cards[0]);
				player.storage.yb053_lvxin_list.push(get.type(trigger.cards[0]));
				player.recover();
			} else if (result.control == '加上限') {
				player.discard(trigger.cards[0]);
				player.storage.yb053_lvxin++;
				player.markSkill('yb053_lvxin');
			} else {
				event.finish();
			}
		},
		init(player) {
			player.storage.yb053_lvxin = 0;
			player.storage.yb053_lvxin_list = [];
		},
		intro: {
			content: '本回合手牌上限+#',
		},
		mod: {
			maxHandcard(player, num) {
				return num + player.storage.yb053_lvxin;
			},
		},
		ai: {
			threaten: 2,
		},
	},
	yb053_yinren: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		getname(player) {
			if (player.storage.yb053_yinren == true) {
				return '迸射';
			}
			return '隐忍';
		},
		levelUpFilter(player) {
			if (!player.storage.yb053_yinren) {
				return true;
			}
			return false;
		},
		levelUp(player) {
			player.storage.yb053_yinren = true;
			player.addSkill('yb053_yinren_after');
		},
		group: ['yb053_yinren_damage', 'yb053_yinren_die'],
		subSkill: {
			damage: {
				forced: true,
				trigger: {
					player: 'damageBegin4',
				},
				content() {
					'step 0';
					player.chooseToDiscard('h', 1);
					('step 1');
					if (!result.bool) {
						trigger.num++;
					}
					player.addTempSkill('yb053_yinren_after');
				},
			},
			after: {
				trigger: {
					global: 'phaseEnd',
				},
				forced: true,
				content() {
					'step 0';
					let list = [];
					event.num = 1;
					if (player.getDamagedHp() > 0) {
						event.num += Math.min(player.getDamagedHp(), 3);
					}
					if (player.getDamagedHp() > 0) {
						list.push('回血');
					}
					list.push('摸' + get.cnNumber(event.num) + '张牌');
					if (list.length == 1) {
						event._result = { control: list[0] };
					} else {
						player.chooseControl(list, true).set('prompt', '请选择回复2点体力或摸' + get.cnNumber(event.num) + '张牌');
					}
					('step 1');
					if (result.control == '回血') {
						player.recover(2);
					} else {
						player.draw(event.num);
					}
				},
			},
			die: {
				trigger: {
					player: 'dyingAfter',
				},
				forced: true,
				filter(event, player) {
					if (!player.storage.yb053_yinren) {
						return true;
					}
					return false;
				},
				content() {
					player.storage.yb053_yinren = true;
					player.addSkill('yb053_yinren_after');
				},
			},
		},
	},

	yb054_caijin: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'useCard',
		},
		filter(event, player) {
			return get.type(event.card) == 'equip' && event.card.number > 1 && event.player != player;
		},
		content() {
			'step 0';
			let cards = trigger.cards[0];
			let card = get.copy(cards);

			const tag = get.YB_tag(card);

			let cardxx;
			game.broadcastAll(
				function (card, cards, tag, cardx) {
					cards.YB_init([card.suit, card.number - 1, card.name, card.nature, tag]);
					cardxx = game.YB_createCard(cardx.name, cardx.suit, 1, cardx.nature, tag);
					cardxx.storage._yb054_caijin = cards;
				},
				card,
				cards,
				tag,
				trigger.card,
			);
			player.gain(cardxx, 'gain2');
			player.chooseUseTarget(cardxx);
		},
	},

	yb054_xiezhi: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb054_chouqi: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb054_zhishang: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: { player: 'damageAfter' },
		content() {
			'step 0';
			player.draw(3);
			('step 1');
			if (player.storage.yb054_zhishang && player.storage.yb054_zhishang == trigger) {
				delete player.storage.yb054_zhishang;
				player.loseMaxHp();
			}
		},
		group: 'yb054_zhishang_2',
		subSkill: {
			2: {
				trigger: { player: 'damageBegin3' },
				forced: true,
				filter(event, player) {
					return !player.isLinked() && event.hasNature();
				},
				content() {
					player.storage.yb054_zhishang = trigger;
				},
			},
		},
		ai: {
			maixie: true,
			maixie_hp: true,
			effect: {
				target(card, player, target) {
					if (player.hasSkillTag('jueqing', false, target)) {
						return [1, -1];
					}
					if (get.tag(card, 'natureDamage')) {
						return [1, -2];
					}
					return 0.8;
				},
			},
		},
	},
	yb054_tongxin: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'damageBegin4',
		},
		forced: true,
		filter(event, player) {
			if (event.player == player) {
				return false;
			}
			if (!event.source) {
				return false;
			}
			if (event.num <= 1) {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			let list = [];
			list.push('是');
			list.push('cancel2');
			event.tar = trigger.player;
			player
				.chooseControl(list)
				.set('prompt', get.translation(trigger.player) + '即将受到' + get.cnNumber(trigger.num) + '点' + get.translation(trigger.nature) + '伤害,是否令此伤害-1,然后自己受到1点无来源伤害？')
				.set('ai', function () {
					const attitude = get.attitude(player, trigger.player);
					if (attitude >= 0) {
						return 0;
					}
					if (attitude < 0) {
						if (player.hp > 2) {
							return 2;
						}
						return 1;
					}
				});
			('step 1');
			if (result.control == '是') {
				trigger.num--;
				player.storage.yb054_tongxin = trigger;
			} else {
				event.finish();
			}
		},
		ai: {
			expose: 0.3,
		},
		group: 'yb054_tongxin_2',
		subSkill: {
			2: {
				trigger: { global: 'damageEnd' },
				audio: 'yb054_tongxin',
				forced: true,
				filter(e, p) {
					return p.storage.yb054_tongxin && p.storage.yb054_tongxin == e;
				},
				content() {
					let nature = trigger.nature;
					player.damage(1, 'nosource', nature);
					delete player.storage.yb054_tongxin;
				},
			},
		},
	},
	yb054_qiangzhi: {
		audio: 'ext:夜白神略/audio/character:2',
		zhuanhuanji: true,
		mark: true,
		marktext: '☯',
		intro: {
			content(storage, player, skill) {
				let str = ['转换技,出牌阶段开始时或当你受到伤害后,你可以', '展示手牌并:', '阳:弃置所有红色手牌;', '阴,弃置所有黑色手牌(无牌不弃)', '然后摸三张牌', '当你因弃置而失去以此法摸的牌时,你令此技能下次发动仅转一下,并对当前回合角色造成一点伤害'];
				if (player.storage.yb054_qiangzhi) {
					str[2] = '<span class=thundertext>' + str[2] + '</span>';
				} else {
					str[3] = '<span class=thundertext>' + str[3] + '</span>';
				}
				if (player.storage.yb054_qiangzhi_top == true) {
					str[1] = '<span style="text-decoration: line-through;text-decoration-color: red;">' + str[1];
					str.push(str[5]);
					str[4] += '</span>转一下:';
					str[5] = player.storage.yb054_qiangzhi ? '<span class=thundertext>阳</span>' : '<span class=thundertext>阴</span>';
					str[5] += '';
				}
				return str.join('');
			},
		},
		trigger: {
			player: ['phaseUseBegin', 'damageEnd'],
		},
		filter(event, player) {
			return player.isIn();
		},
		check(event, player) {
			const color = player.storage.yb054_qiangzhi ? 'red' : 'black';
			let target = _status.currentPhase;
			let cards = player.getCards('h', { color: target });
			if (cards.length) {
				if (get.attitude(player, target) > 0) {
					return false;
				} else if (cards.forEach((c) => get.value(c) > 5)) {
					return false;
				}
				return true;
			}
			return true;
		},
		init(player) {
			player.storage.yb054_qiangzhi = true;
		},
		content() {
			'step 0';
			if (player.storage.yb054_qiangzhi_top) {
				player.storage.yb054_qiangzhi_top = false;
				player.unmarkSkill('yb054_qiangzhi_top');
				event.goto(3);
			}
			('step 1');
			const color = player.storage.yb054_qiangzhi ? 'red' : 'black';
			if (player.countCards('h')) {
				player.showCards(player.getCards('h'));
				player.discard(player.getCards('h', { color: color }), true);
			}
			('step 2');
			player.draw(3).gaintag.addArray(['yb054_qiangzhi_top']);
			('step 3');
			player.changeZhuanhuanji('yb054_qiangzhi');
		},
		group: ['yb054_qiangzhi_top'],
		subSkill: {
			top: {
				trigger: {
					player: 'loseAfter',
					global: 'loseAsyncAfter',
				},
				filter(event, player) {
					if (event.type != 'discard') {
						return false;
					}
					let evt = event.getl(player);
					if (!evt || !evt.cards || !evt.cards.length) {
						return false;
					}
					for (let i in evt.gaintag_map) {
						if (evt.gaintag_map[i].includes('yb054_qiangzhi_top')) {
							return true;
						}
					}
					return false;
				},
				mark: true,
				marktext: '转',
				forced: true,
				content() {
					'step 0';
					player.markSkill('yb054_qiangzhi_top');
					player.storage.yb054_qiangzhi_top = true;
					('step 1');
					let target = _status.currentPhase;
					if (target.isIn()) {
						target.damage();
					}
				},
			},
		},
	},

	yb055_zhuandu: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'useCard',
		},
		filter(event, player) {
			const history = player.getHistory('useCard');
			if (!history) {
				return true;
			} else {
				const suits = [event.card.suit];
				for (let i = 0; i < history.length; i++) {
					suits.add(history[i].card.suit);
				}
				if (suits.length > 1) {
					return false;
				}
				return true;
			}
		},
		content() {
			let num = player.getHistory('useCard').length;
			if (num > player.maxHp) {
				num = player.maxHp;
			}
			player.draw(num);
		},
		mark: true,
		marktext: '笃',
		intro: {
			markcount(storage, player) {
				const history = player.getHistory('useCard');
				if (!history) {
					return false;
				} else {
					const suits = [];
					for (let i = 0; i < history.length; i++) {
						suits.add(history[i].card.suit);
					}
					if (suits.length > 1) {
						return false;
					}
					return get.translation(suits[0]);
				}
			},
		},
		ai: {
			effect: {
				player_use(card, player, target) {
					const suits = [],
						suit = card.suit;
					player.getHistory('useCard', (evt) => suits.add(evt.card.suit));
					if (suits.length > 1) {
						return;
					}
					if (suits.length == 1 && card.suit == suits[0]) {
						return [1, 2];
					}
					if (!player.isPhaseUsing()) {
						return [1, player.countCards('hs', { suit }) / 5];
					}
					let cards = player.getCards('hs', (card) => card.suit == suit),
						names = cards.reduce((a, b) => a.add(b.name), []),
						len = cards.length;
					for (const name of names) {
						let usable = player.getCardUsable(name, true) - player.countUsed(name),
							count = cards.filter((i) => i.name == name).length;
						if (name == 'tao') {
							usable = Math.min(usable, player.getDamagedHp());
						}
						len -= Math.max(count - usable, 0);
					}
					return [1, len / 2];
				},
			},
		},
		mod: {
			aiOrder(player, card, num) {
				const suits = [],
					suit = card.suit,
					event = get.event();
				player.getHistory('useCard', (evt) => suits.add(evt.card.suit));
				if (suits.length == 1 && suit == suits[0]) {
					return num + 100;
				}
				let cards = player.getCards('hs', (card) => card.suit == suit),
					names = cards.reduce((a, b) => a.add(b.name), []),
					len = cards.length;
				for (const name of names) {
					let usable = player.getCardUsable(name, true) - player.countUsed(name),
						count = cards.filter((i) => i.name == name).length;
					if (name == 'tao') {
						usable = Math.min(usable, player.getDamagedHp());
					}
					len -= Math.max(count - usable, 0);
				}
				return num + len * 10;
			},
			aiValue(player, card, num) {
				const history = player.getHistory('useCard');
				if (history) {
					const suits = [];
					for (let i = 0; i < history.length; i++) {
						suits.add(history[i].card.suit);
					}
					if (suits.length == 1) {
						if (card.suit == suits[0]) {
							return num + 100;
						}
					}
				}
			},
		},
	},
	yb055_zangxin: {
		audio: 'ext:夜白神略/audio/character:2',
		mod: {
			cardname(card, player, name) {
				if (card.suit == 'heart') {
					return 'tao';
				}
			},
		},
		trigger: { player: 'useCard' },
		forced: true,
		filter(event, player) {
			return event.card && event.card.name == 'tao' && event.card.suit == 'heart';
		},
		content() { },
	},

	yb059_huiguang: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		mark: true,
		intro: {
			mark(dialog, storage, player) {
				let list = lib.skill.yb059_huiguang.ybsl_059starsFall(player);
				dialog.addText('剩余公主');
				dialog.addSmall([list, 'character']);
			},
		},
		trigger: {
			player: 'enterGame',
			global: 'phaseBefore',
		},
		filter(event, player) {
			let list = [];
			if (lib.character[player.name]) {
				list.add([player.name]);
			}
			if (lib.character[player.name1]) {
				list.add([player.name1]);
			}
			if (lib.character[player.name2]) {
				list.add([player.name2]);
			}
			for (let i = 1; i <= 4; i++) {
				if (list.includes('ybsl_059starsFall' + i)) {
					return false;
				}
			}
			if (!player.storage.yb059_huiguang) {
				return false;
			}
			return event.name != 'phase' || game.phaseNumber == 0;
		},
		ybsl_059starsFall(player) {
			const kkk = [];
			if (lib.character[player.name] && lib.character[player.name][3].includes('yb059_huiguang')) {
				kkk.add([player.name]);
			}
			if (lib.character[player.name1] && lib.character[player.name1][3].includes('yb059_huiguang')) {
				kkk.add([player.name1]);
			}
			if (lib.character[player.name2] && lib.character[player.name2][3].includes('yb059_huiguang')) {
				kkk.add([player.name2]);
			}
			if (!player.storage.yb059_huiguang && kkk.length) {
				player.storage.yb059_huiguang = ['ybsl_059starsFall1', 'ybsl_059starsFall2', 'ybsl_059starsFall3', 'ybsl_059starsFall4'];
			}

			return player.storage.yb059_huiguang;
		},
		init(player) {
			const kkk = [];
			if (lib.character[player.name] && lib.character[player.name][3].includes('yb059_huiguang')) {
				kkk.add([player.name]);
			}
			if (lib.character[player.name1] && lib.character[player.name1][3].includes('yb059_huiguang')) {
				kkk.add([player.name1]);
			}
			if (lib.character[player.name2] && lib.character[player.name2][3].includes('yb059_huiguang')) {
				kkk.add([player.name2]);
			}
			if (!player.storage.yb059_huiguang && kkk.length) {
				player.storage.yb059_huiguang = ['ybsl_059starsFall1', 'ybsl_059starsFall2', 'ybsl_059starsFall3', 'ybsl_059starsFall4'];
			}
		},
		content() {
			const kkk = [];
			if (lib.character[player.name] && lib.character[player.name][3].includes('yb059_huiguang')) {
				kkk.add([player.name]);
			}
			if (lib.character[player.name1] && lib.character[player.name1][3].includes('yb059_huiguang')) {
				kkk.add([player.name1]);
			}
			if (lib.character[player.name2] && lib.character[player.name2][3].includes('yb059_huiguang')) {
				kkk.add([player.name2]);
			}
			('step 0');
			let list = lib.skill.yb059_huiguang.ybsl_059starsFall(player);
			if (!list.length || !kkk.length) {
				event.finish();
			} else {
				player
					.chooseButton(true)
					.set('ai', function (button) {
						return true;
					})
					.set('createDialog', ['将' + get.translation(kkk[0]) + '替换为一名角色', [list, 'character']]);
			}

			('step 1');
			player.reinit(kkk[0], result.links[0], false);
			lib.skill.yb059_huiguang.ybsl_059starsFall(player).remove(result.links[0]);
			let list1 = [];
			if (lib.character[kkk[0]]) {
				list1.addArray(lib.character[kkk[0]][3]);
			}
			player.addSkill(list1);
			game.broadcastAll(function (list) {
				lib.character[result.links[0]][3].addArray(list);
				game.expandSkills(list);
			}, list1);
		},
		group: ['yb059_huiguang_die'],
		subSkill: {
			die: {
				audio: 'yb059_huiguang',
				trigger: { player: 'dieBefore' },
				filter(event, player) {
					const kkk = [];
					if (lib.character[player.name] && lib.character[player.name][3].includes('yb059_huiguang')) {
						kkk.add([player.name]);
					}
					if (lib.character[player.name1] && lib.character[player.name1][3].includes('yb059_huiguang')) {
						kkk.add([player.name1]);
					}
					if (lib.character[player.name2] && lib.character[player.name2][3].includes('yb059_huiguang')) {
						kkk.add([player.name2]);
					}
					if (!kkk) {
						return false;
					}
					return lib.skill.yb059_huiguang.ybsl_059starsFall(player).length && event.parent.name != 'giveup' && player.maxHp > 0;
				},
				forced: true,
				content() {
					'step 0';
					trigger.cancel();
					if (player.maxHp > 1) {
						player.loseMaxHp();
					}
					('step 1');
					player.useSkill('yb059_huiguang');
					('step 2');
					player.hp = player.maxHp;
				},
			},
		},
	},
	yb059_xingshi: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		usable: 1,
		trigger: {
			player: 'useCardToPlayered',
			target: 'useCardToTargeted',
		},
		filter(event, player, name) {
			if (event.targets.length != 1) {
				return false;
			}
			if (event.player != player && player != event.targets[0]) {
				return false;
			}
			if (event.player == player && player == event.targets[0]) {
				return false;
			}
			return true;
		},
		ai: {
			effect: {
				player(card, player, target) {
					if (!player.storage.counttrigger || !player.storage.counttrigger.yb059_xingshi || player.storage.counttrigger.yb059_xingshi <= 0) {
						if (player != target && ui.selected.targets.length == 1) {
							const num1 = player.hp + Math.min(player.hp, 5) - player.countCards('h');
							let num2 = target.hp + Math.min(target.hp, 5) - target.countCards('h');
							return [1, -num2, 1, -num1];
						}
					}
					return 1;
				},
				target(card, player, target) {
					if (!player.storage.counttrigger || !player.storage.counttrigger.yb059_xingshi || player.storage.counttrigger.yb059_xingshi <= 0) {
						if (player != target && ui.selected.targets.length == 1) {
							const num1 = player.hp + Math.min(player.hp, 5) - player.countCards('h');
							let num2 = target.hp + Math.min(target.hp, 5) - target.countCards('h');
							return [1, -num2, 1, -num1];
						}
					}
					return 1;
				},
			},
		},
		content() {
			let tar;
			if (trigger.player == player) {
				tar = trigger.targets[0];
			} else {
				tar = trigger.player;
			}
			trigger.card.yb059_xingshi = [player, tar];
			if (!_status.yb059_xingshi) {
				_status.yb059_xingshi = {};
			}
			_status.yb059_xingshi[trigger.card] = [player, tar];
			player.discard(player.getCards('h'));
			const next = tar.discard(tar.getCards('h'));
			next.notBySelf = true;
			next.discarder = player;
		},
		group: ['yb059_xingshi_use'],
		subSkill: {
			use: {
				trigger: { global: 'useCardAfter' },
				forced: true,
				filter(event, player) {
					if (!_status.yb059_xingshi) {
						return false;
					}
					if (!_status.yb059_xingshi[event.card]) {
						return false;
					}
					return true;
				},
				content() {
					'step 0';
					event.num = 0;
					event.list = _status.yb059_xingshi[trigger.card];
					('step 1');
					delete _status.yb059_xingshi[trigger.card];
					('step 2');
					if (event.list[event.num].isIn()) {
						event.list[event.num].draw(Math.min(event.list[event.num].hp, 5));
					}
					('step 3');
					if (event.num < 1) {
						event.num++;
						event.goto(2);
					}
				},
			},
		},
	},
	yb059_guanhong: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		content() {
			const next = player.judge();
			next.callback = function () {
				player.gain(event.judgeResult.card);
			};
		},
		ai: {
			result: {
				player: 1,
			},
			order: 11,
		},
		group: ['yb059_guanhong_judge', 'yb059_guanhong_sha'],
		subSkill: {
			judge: {
				audio: 'yb059_guanhong',
				forced: true,
				mark: true,
				marktext: '虹',
				intro: {
					content(storage, player) {
						if (storage) {
							return '记录的花色是' + get.translation(storage);
						}
						return '无';
					},
				},
				trigger: { player: 'judgeEnd' },
				content() {
					player.markSkill('yb059_guanhong_judge');
					player.storage.yb059_guanhong_judge = trigger.result.card.suit;
				},
			},
			sha: {
				audio: 'yb059_guanhong',
				trigger: { global: 'useCard' },
				filter(event, player) {
					if (!player.storage.yb059_guanhong_judge) {
						return false;
					}
					if (player.storage.yb059_guanhong_judge != event.card.suit) {
						return false;
					}
					if (player.canUse('sha', event.player, false)) {
						return true;
					}
					return false;
				},
				logTarget(event, player) {
					return event.player;
				},
				prompt(event, player) {
					return '是否视为对' + get.translation(event.player) + '使用一张杀';
				},
				check(event, player) {
					let eff = get.effect(event.player, { name: 'sha' }, player, _status.event.player);
					let att = get.attitude(_status.event.player, event.player);
					return eff > 0;
				},
				content() {
					player.useCard({ name: 'sha', isCard: false }, trigger.player, false);
				},
			},
		},
	},
	yb059_zhuotan: {
		audio: 'ext:夜白神略/audio/character:2',
		chongzhiji: true,
		chongzhiList: ['jiu', 'tao', 'shan', 'sha'],
		init(player, skill) {
			player.storage[skill + '_chongzhijiList'] = lib.skill[skill].chongzhiList;
		},

		mark: true,
		intro: {
			content(storage, player) {
				storage = get.YB_chongzhiList(player, 'yb059_zhuotan');
				if (!storage) {
					return '无';
				}
				let list1 = player.storage['yb059_zhuotan_chongzhijiList'];

				let str = '<br>';
				for (let i = 0; i < list1.length; i++) {
					if (storage.includes(list1[i])) {
						str += '<span class=yellowtext>' + get.translation(list1[i]) + '</span><br>';
					} else {
						str += '<span style="opacity:0.5;">' + get.translation(list1[i]) + '</span><br>';
					}
				}
				for (let i = 0; i < storage.length; i++) {
					if (!list1.includes(storage[i])) {
						str += '<span class=thundertext>' + get.translation(storage[i]) + '</span><br>';
					}
				}
				return '当前列表如下:' + str;
			},
		},
		enable: 'chooseToUse',
		filter(event, player) {
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			let list = get.YB_chongzhiList(player, 'yb059_zhuotan');
			for (let i = 0; i < list.length; i++) {
				if (evt({ name: list[i] }, player, event)) {
					return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];
				let list2 = get.YB_chongzhiList(player, 'yb059_zhuotan');
				for (let i = 0; i < list2.length; i++) {
					list.push(['濯潭', '', list2[i]]);
				}
				return ui.create.dialog('濯潭', [list, 'vcard']);
			},
			filter(button, player) {
				return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
			},
			check(button) {
				if (_status.event.parent.type != 'phase') {
					return 1;
				}
				const player = _status.event.player;
				return player.getUseValue({
					name: button.link[2],
					nature: button.link[3],
				});
			},
			backup(links, player) {
				return {
					filterCard(card, player) {
						return false;
					},
					selectCard: -1,

					audio: 'yb059_zhuotan',
					popname: true,
					viewAs: { name: links[0][2] },
					precontent() {
						'step 0';
						let name = event.result.card.name;
						let list = get.YB_chongzhiList(player, 'yb059_zhuotan');
						let num = 1;
						for (let i = 0; i < list.length; i++) {
							if (name == list[i]) {
								num += i;
							}
						}
						player.YB_changeHandCard(num);
						('step 1');
						get.YB_chongzhiList(player, 'yb059_zhuotan').remove(event.result.card.name);
					},
				};
			},
			prompt(links, player) {
				let name = links[0][2];
				let list = get.YB_chongzhiList(player, 'yb059_zhuotan');
				let num = 1;
				for (let i = 0; i < list.length; i++) {
					if (name == list[i]) {
						num += i;
					}
				}
				return '将手牌调整至' + num + '张,视为使用一张' + get.translation(links[0][2]) + '';
			},
		},
		hiddenCard(player, name) {
			let list = get.YB_chongzhiList(player, 'yb059_zhuotan');
			return list.includes(name);
		},
		ai: {
			respondSha: true,
			respondShan: true,
			order(item, player) {
				if (!player) {
					const player = _status.event.player;
				}
				if (get.YB_chongzhiList(player, 'yb059_zhuotan') && get.YB_chongzhiList(player, 'yb059_zhuotan').length == 1) {
					return get.order(get.YB_chongzhiList(player, 'yb059_zhuotan')[0]) + 5;
				}
				return 5;
			},
			result: {
				player(player) {
					if (_status.event.type == 'dying') {
						return get.attitude(player, _status.event.dying);
					}

					return 5;
				},
			},
		},
	},
	yb059_qingliu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'useCard' },
		forced: true,
		clanSkill: true,
		filter(event, player) {
			if (!event.cards.length) {
				return true;
			}
			return !game.hasPlayer2((current) => {
				if (current != player) {
					return false;
				}
				return current.hasHistory('lose', (evt) => {
					return evt.parent == event && evt.hs.length;
				});
			});
		},
		content() {
			player.YB_zhongliu();
		},
		group: ['yb059_qingliu_draw'],
		subSkill: {
			draw: {
				audio: 'yb059_qingliu',
				trigger: {
					player: 'phaseDrawBegin2',
				},
				forced: true,
				preHidden: true,
				filter(event, player) {
					let num = 6 - player.getStockSkills(true, true).length;
					if (num <= 0) {
						return false;
					}
					return !event.numFixed;
				},
				content() {
					let num = 6 - player.getStockSkills(true, true).length;
					if (num > 0) {
						trigger.num += num;
					}
				},
			},
		},
	},
	yb059_pingyu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { global: 'judge' },
		filter(event, player) {
			return (
				player.countCards('hes', function (card) {
					return true;
				}) > 0
			);
		},
		forced: true,
		content() {
			'step 0';
			player
				.chooseCard(get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' + get.translation(trigger.player.judging[0]) + ',' + get.prompt('yb059_pingyu'), 'hes', function (card, player) {
					player = _status.event.player;
					const mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
					if (mod2 != 'unchanged') {
						return mod2;
					}
					const mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
					if (mod != 'unchanged') {
						return mod;
					}
					return true;
				})
				.set('ai', function (card) {
					const trigger = _status.event.getTrigger();
					const player = _status.event.player;
					const judging = _status.event.judging;
					const result = trigger.judge(card) - trigger.judge(judging);
					const attitude = get.attitude(player, trigger.player);
					if (attitude == 0 || result == 0) {
						return 0;
					}
					if (attitude > 0) {
						return result;
					} else {
						return -result;
					}
				})
				.set('judging', trigger.player.judging[0]);
			('step 1');
			if (result.bool) {
				player.respond(result.cards, 'highlight', 'yb059_pingyu', 'noOrdering');
				if (trigger.player.judging[0].suit == result.cards[0].suit) {
					event.YB_draw = true;
				}
			} else {
				event.finish();
			}
			('step 2');
			if (result.bool) {
				player.$gain2(trigger.player.judging[0]);
				player.gain(trigger.player.judging[0]);
				trigger.player.judging[0] = result.cards[0];
				trigger.orderingCards.addArray(result.cards);
				game.log(trigger.player, '的判定牌改为', result.cards[0]);
			}
			('step 3');
			if (event.YB_draw) {
				player.draw();
			}
			('step 4');
		},
		ai: {
			rejudge: true,
			tag: {
				rejudge: 1,
			},
		},
		group: ['yb059_pingyu_lingyu'],
		subSkill: {
			lingyu: {
				audio: 'yb059_pingyu',
				trigger: {
					global: 'phaseJudgeBegin',
				},
				check(event, player) {
					return get.attitude(player, event.player) <= 0;
				},
				filter(event, player) {
					return event.player.countCards('j') == 0;
				},
				content() {
					trigger.player.executeDelayCardEffect('ybsl_lingyu');
				},
				ai: {
					expose: 1,
					threaten: 0.5,
				},
			},
		},
		derivation: ['ybsl_lingyu'],
	},

	yb067_chanqing: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterTarget(card, player, target) {
			return player != target;
		},
		intro: {
			content(content, player) {
				return '上次缠情是和' + get.translation(player.storage.yb067_chanqing) + '进行的';
			},
		},
		filterCard: false,

		async content(event, trigger, player) {
			player.storage.yb067_chanqing1.push(event.target);
			if (event.target == player.storage.yb067_chanqing) {
				player.changeGroup('YB_memory');
				player.recover();
			} else {
				player.changeGroup('YB_dream');
				player.draw(2);
			}
			player.storage.yb067_chanqing = event.target;
			player.markSkill('yb067_chanqing');
			event.num = 0;
			while (event.num < event.target.hp && event.num < 5) {
				event.num++;
				await player.chooseToDiscard('h', true);
				if (event.target.countCards('h') <= event.target.maxHp) {
					await event.target.draw();
				}
				const result = await player.gainPlayerCard('h', event.target, true).forResult();
				if (result.bool) {
					await player.chooseUseTarget(result.cards[0], true, false);
					game.log(result.cards[0], event.num);
				}
			}
			const result1 = await player
				.chooseButton(['选择任意项执行', [['令自己摸' + event.num + '张牌', '令' + get.translation(event.target) + '摸' + event.num + '张牌'], 'textbutton']], [0, 2])
				.set('ai', (button) => {
					const player = _status.event.player;
					switch (button.link) {
						case '令自己摸' + event.num + '张牌':
							return event.num;
						case '令' + get.translation(event.target) + '摸' + event.num + '张牌':
							return event.target.isFriendsOf(player);
					}
				})
				.forResult();
			if (result1.bool && result1.links.length) {
				if (result1.links.includes('令自己摸' + event.num + '张牌')) {
					player.draw(event.num);
				}
				if (result1.links.includes('令' + get.translation(event.target) + '摸' + event.num + '张牌')) {
					event.target.draw(event.num);
				}
			}
		},

		group: ['yb067_chanqing_last', 'yb067_chanqing1'],
		subSkill: {
			last: {
				trigger: {
					player: 'phaseUseEnd',
				},
				forced: true,
				filter(event, player) {
					return !player.hasHistory('useSkill', function (evt) {
						if (evt.skill != 'yb067_chanqing') {
							return false;
						}
						return evt.event.getParent('phaseUse') == event;
					});
				},
				content() {
					delete player.storage.yb067_chanqing;
				},
			},
		},
		ai: {
			order: 5.5,
			result: {
				player(player, target) {
					return target.hp - 1.1;
				},
				target(player, target) {
					return 1;
				},
			},
			threaten: 2.4,
		},
	},
	yb067_chanqing1: {
		trigger: {
			player: 'phaseAfter',
		},
		forced: true,
		unseen: true,
		mark: true,
		init(player, skill) {
			player.storage.yb067_chanqing1 = [];
		},
		intro: {
			content(content, player) {
				return '本回合已和' + get.translation(player.storage.yb067_chanqing1) + '缠过情';
			},
		},
		filter(event, player) {
			return player.storage.yb067_chanqing1;
		},
		content() {
			for (let i = 0; i < player.storage.yb067_chanqing1.length; i++) {
				player.storage.yb067_chanqing1.remove(player.storage.yb067_chanqing1[0]);
			}
			player.removeMark('yb067_chanqing1', player.countMark('yb067_chanqing1'));
		},
	},
	yb067_kuiyi: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseJieshuBegin',
		},
		groupSkill: true,
		prompt: '是否弃置所有手牌？',

		filter(event, player) {
			return player.countCards('h') > 0 && player.group == 'YB_memory';
		},
		content() {
			'step 0';
			event.num = player.countCards('h');
			event.cards = player.getCards('h');
			const suits = [];
			if (Array.isArray(event.cards)) {
				for (const i of event.cards) {
					suits.add(i.suit);
				}
			}
			event.suits = suits.length;
			event.numb = 1;
			event.list = [];
			event.list2 = [];
			event.map = {};
			('step 1');
			player.discard(event.cards);
			('step 2');
			let str = '目标角色将';
			switch (event.numb) {
				case 1:
					str += '摸一张牌';
					break;
				case 2:
					str += '回复1点体力';
					break;
				case 3:
					str += '增加1点体力上限';
					break;
				case 4:
					str += '摸三张牌';
					break;
			}
			event.str = str;
			if (event.numb >= 4) {
				event.num = 1;
			}
			('step 3');
			if (event.suits >= 1) {
				player
					.chooseTarget([1, event.num], true, '请选择一' + (event.num > 1 ? '至' + get.cnNumber(event.num) : '') + '名角色')
					.set('prompt2', event.str)
					.set('ai', function (target) {
						let player = _status.event.player,
							att = get.attitude(player, target);
						if (att >= 0) {
							return event.numb;
						}
						if (att < 0) {
							return -event.numb;
						}
						if (att >= 0 && player.storage.yb067_chanqing1.includes(target)) {
							return event.numb * 2;
						}
						if (target == player) {
							return event.numb;
						}
					});
			}
			('step 4');
			event.targets = result.targets;
			('step 5');
			switch (event.numb) {
				case 1:
					event.targets[0].draw();
					break;
				case 2:
					event.targets[0].recover();
					break;
				case 3:
					event.targets[0].gainMaxHp();
					break;
				case 4:
					event.targets[0].draw(3);
					break;
			}
			('step 6');
			if (player.storage.yb067_chanqing1.includes(event.targets[0])) {
				if (!event.list.includes(event.targets[0])) {
					event.list.push(event.targets[0]);
					event.list2.push(event.numb);
				} else {
					for (let i = 0; i < event.list.length; i++) {
						if (event.list[i] == event.targets[0]) {
							event.list2[i] = event.numb;
						}
					}
				}
			}
			('step 7');
			event.targets.remove(event.targets[0]);
			('step 8');
			if (event.targets.length) {
				event.goto(5);
			} else {
				if (event.numb >= event.suits) {
					event.goto(9);
				} else {
					event.numb++;
					event.goto(2);
				}
			}
			('step 9');
			if (event.list.length) {
				for (let i = 0; i < event.list.length; i++) {
					const tar = event.list[i];
					let num = event.list2[i];
					switch (num) {
						case 1:
							tar.draw();
							break;
						case 2:
							tar.recover();
							break;
						case 3:
							tar.gainMaxHp();
							break;
						case 4:
							tar.draw(3);
							break;
					}
				}
			}
		},
		ai: {
			threaten: 1.1,
		},
	},
	yb067_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb068_mingzhu: {
		inherit: 'yb010_mingzhu',
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb068_chenyu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'phaseJieshuBegin' },
		forced: true,
		preHidden: true,
		content() {
			let x = player.getDamagedHp();
			if (x > 3) {
				x = 3;
			}
			player.draw(x + 1);
		},
	},
	yb068_jingyue: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'chooseToUse',
		onChooseToUse(event) {
			if (game.online || event.type != 'phase') {
				return;
			}
			let list = [];
			event.player.getHistory('useCard', function (evt) {
				let name = evt.card.name;
				const type = get.type(name);
				if (type != 'basic' && type != 'trick' && type != 'ybsl_flower') {
					return;
				}
				if (name == 'sha') {
					let nature = evt.card.nature;
					switch (nature) {
						case 'fire':
							name = 'huosha';
							break;
						case 'thunder':
							name = 'leisha';
							break;
						case 'kami':
							name = 'kamisha';
							break;
						case 'ice':
							name = 'icesha';
							break;
						case 'stab':
							name = 'cisha';
							break;
						case 'YB_snow':
							name = 'YB_snowsha';
							break;
						case 'YB_blood':
							name = 'YB_bloodsha';
							break;
					}
				}
				list.add(type + '咕咕' + name);
			});
			event.set('yb068_jingyue_list', list);
		},
		filter(event, player) {
			return event.yb068_jingyue_list && event.yb068_jingyue_list.length;
		},
		chooseButton: {
			dialog(event, player) {
				return ui.create.dialog('镜月', [
					event.yb068_jingyue_list.map(function (i) {
						return i.split('咕');
					}),
					'vcard',
				]);
			},
			filter(button, player) {
				return lib.filter.cardEnabled(
					{
						name: button.link[2],
						nature: button.link[3],
					},
					player,
				);
			},
			check(button) {
				return _status.event.player.getUseValue(
					{
						name: button.link[2],
						nature: button.link[3],
					},
					false,
				);
			},
			backup(links, player) {
				return {
					popname: true,
					filterCard: false,
					selectCard: 0,
					audio: 'yb068_jingyue',
					viewAs: {
						name: links[0][2],
						nature: links[0][3],
					},
					onuse(links, player) {
						if (player.hp > 1) {
							player.loseHp();
						}
					},
				};
			},
			prompt(links, player) {
				let str = player.hp > 1 ? '失去1点体力并' : '';
				return str + '视为使用一张' + get.translation(links[0][2]);
			},
		},
	},
	yb068_jingyue2: { onremove: true },
	yb068_yingxian: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',
		filter(event, player) {
			let num = player.getExpansions('yb068_yingxian');
			if (num && num.length) {
				return true;
			}
			return false;
		},
		check(event, player) {
			let num = player.getExpansions('yb068_yingxian');
			if (num && num.length > 3) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			player.loseHp();

			('step 1');

			('step 2');
			let list = player.getExpansions('yb068_yingxian');
			let card = list[list.length - 1];
			const next = player.chooseUseTarget(card);
			if (get.info(card).updateUsable == 'phaseUse') {
				next.addCount = false;
			}
			('step 3');
			if (player.getExpansions('yb068_yingxian').length) {
				event.goto(1);
			}
		},
		group: ['yb068_yingxian_use', 'yb068_yingxian_delete'],
		mark: true,
		intro: {
			content: 'expansion',
			markcount: 'expansion',

			mark: 'expansion',
		},
		subSkill: {
			use: {
				trigger: { player: 'useCardAfter' },
				filter(event, player) {
					if (!player.isPhaseUsing) {
						return false;
					}

					if (event.getParent(2).name && event.getParent(2).name == 'yb068_yingxian') {
						return false;
					}
					if (!event.card) {
						return false;
					}
					if (!event.card.isCard) {
						return false;
					}
					return get.position(event.cards[0], true) == 'o';
				},
				forced: true,
				popup: true,
				content() {
					player.addToExpansion(trigger.cards[0], player, 'giveAuto').gaintag.add('yb068_yingxian');
				},
			},
			delete: {
				trigger: { player: 'phaseUseAfter' },
				filter(event, player) {
					let num = player.getExpansions('yb068_yingxian');
					if (num && num.length) {
						return true;
					}
					return false;
				},
				forced: true,
				popup: true,
				content() {
					player.discard(player.getExpansions('yb068_yingxian'));
				},
			},
		},
	},

	yb069_yaomian: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',
		filterTarget(card, player, target) {
			if (player == target) {
				return false;
			}
			let str = '';
			if (target.hasSex('male')) {
				str += '获得一张牌<br>';
			}
			str += '各自翻面';
			target.prompt(str);
			return player != target;
		},
		filterCard: false,
		content: async function (event, trigger, player) {
			let target = event.target;
			if (target.countCards('he') > 0 && target.hasSex('male')) {
				await player.gainPlayerCard(target, true, 'he', 1);
			}
			await player.turnOver();
			await target.turnOver();
		},

		ai: {
			order: 6,
			result: {
				player(player, target) {
					let num = 0;
					if (player.classList.contains('turnedover')) {
						num += 10;
					}
					if (target.hasSex('male')) {
						num += 1;
					}
					return num;
				},
				target(player, target) {
					let num = 0;
					if (!target.classList.contains('turnedover')) {
						num -= 6;
					}
					if (target.classList.contains('turnedover')) {
						num += 10;
					}
					if (target.hasSex('male')) {
						num -= 1;
					}
					return num;
				},
			},
			threaten: 1.5,
			effect: {
				target(card) {
					if (card.name == 'guiyoujie') {
						return [0, 2];
					}
				},
			},
		},
	},
	yb069_yaomianx: {
		audio: 'yb069_yaomian',
		usable: 1,
		enable: 'phaseUse',
		filterTarget(card, player, target) {
			if (player == target) {
				return false;
			}
			let str = '';
			if (target.hasSex('male')) {
				str += '获得一张牌<br>';
			}
			str += '各自回血';
			target.prompt(str);
			return player != target;
		},
		filterCard: false,
		content: async function (event, trigger, player) {
			let target = event.target;
			if (target.countCards('he') > 0 && target.hasSex('male')) {
				await player.gainPlayerCard(target, true, 'he', 1);
			}
			await player.recover();
			await target.recover();
		},

		ai: {
			order: 6,
			result: {
				player(player, target) {
					let num = 0;
					if (player.isDamaged()) {
						num += 2;
					}
					if (target.hasSex('male')) {
						num += 1;
					}
					return num;
				},
				target(player, target) {
					let num = 0;
					if (target.isDamaged()) {
						num += 1;
					}

					if (target.hasSex('male')) {
						num -= 1;
					}
					return num;
				},
			},
			threaten: 1.5,
			effect: {
				target(card) {
					if (card.name == 'guiyoujie') {
						return [0, 2];
					}
				},
			},
		},
	},
	yb069_yaomiany: {
		audio: 'yb069_yaomian',
		usable: 1,
		enable: 'phaseUse',
		filterTarget(card, player, target) {
			if (player == target) {
				return false;
			}
			let str = '';
			if (target.hasSex('male')) {
				str += '获得一张牌<br>';
			}
			if (player.storage.yb069_yaomiany && player.storage.yb069_yaomiany.includes(target)) {
				str += '各自回血';
			} else {
				str += '各自翻面';
			}
			target.prompt(str);
			return player != target;
		},
		filterCard: false,
		content: async function (event, trigger, player) {
			let target = event.target;
			if (target.countCards('he') > 0 && target.hasSex('male')) {
				await player.gainPlayerCard(target, true, 'he', 1);
			}
			if (!player.storage.yb069_yaomiany || !player.storage.yb069_yaomiany.includes(target)) {
				player.storage.yb069_yaomiany = player.storage.yb069_yaomiany || [];
				player.storage.yb069_yaomiany.push(target);
				await player.turnOver();
				await target.turnOver();
			} else {
				await player.recover();
				await target.recover();
			}
		},

		ai: {
			order: 6,
			result: {
				player(player, target) {
					let num = 0;
					const storage = player.storage.yb069_yaomiany || [];
					if (storage.includes(target)) {
						if (player.isDamaged()) {
							num += 2;
						}
						if (target.hasSex('male')) {
							num += 1;
						}
					} else {
						if (player.classList.contains('turnedover')) {
							num += 10;
						}
						if (target.hasSex('male')) {
							num += 1;
						}
					}
					return num;
				},
				target(player, target) {
					let num = 0;
					const storage = player.storage.yb069_yaomiany || [];
					if (storage.includes(target)) {
						if (target.isDamaged()) {
							num += 1;
						}
						if (target.hasSex('male')) {
							num -= 1;
						}
					} else {
						if (!target.classList.contains('turnedover')) {
							num -= 6;
						}
						if (target.classList.contains('turnedover')) {
							num += 10;
						}
						if (target.hasSex('male')) {
							num -= 1;
						}
					}
					return num;
				},
			},
			threaten: 1.5,
			effect: {
				target(card) {
					if (card.name == 'guiyoujie') {
						return [0, 2];
					}
				},
			},
		},
	},
	yb069_wenhuan: {
		preHidden: true,
		mark: true,
		audio: 'ext:夜白神略/audio/character:2',
		zhuanhuanji: true,
		marktext: '☯',
		intro: {
			content(storage, player, skill) {
				if (player.storage.yb069_wenhuan == true) {
					return '当场上角色回复体力时,你可以令其翻面,并令此次回复效果+1';
				}
				return '当场上角色受到伤害后,你可令其武将牌复位,然后摸一张牌';
			},
		},
		group: ['yb069_wenhuan_1'],
		subSkill: {
			1: {
				audio: 'yb069_wenhuan',
				trigger: {
					global: ['damageEnd', 'recoverBegin'],
				},
				prompt2(event, player) {
					let str = '';
					str += player.storage.yb069_wenhuan == true ? '是否令其翻面,并令此次回复效果+1' : '是否令其武将牌复位,然后其摸一张牌';
					return str;
				},
				check(event, player) {
					const tar = event.player;
					let att = get.attitude(player, tar);
					if (!player.storage.yb069_wenhuan) {
						if (att <= 0) {
							return false;
						}
						return true;
					} else {
						if (att < 0) {
							if (tar.getDamagedHp() < event.num && !tar.isTurnedOver()) {
								return true;
							}
							return false;
						} else {
							if (tar.isTurnedOver()) {
								return true;
							}
							return tar.getDamagedHp() < event.num || tar.hp <= 0;
						}
					}
				},
				filter(event, player) {
					if (!player.storage.yb069_wenhuan) {
						return event.name == 'damage' && event.player.isAlive();
					} else {
						return event.name == 'recover' && event.player.isAlive();
					}
				},
				logTarget(event, player) {
					return event.player;
				},
				content() {
					'step 0';
					player.changeZhuanhuanji('yb069_wenhuan');
					if (trigger.name == 'recover') {
						trigger.num++;
						trigger.player.turnOver();
						event.goto(2);
					} else {
						trigger.player.turnOver(false);
					}

					('step 1');
					trigger.player.link(false);
					trigger.player.draw();
					('step 2');
				},
			},
		},
	},
	yb069_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb070_queshi: {
		audio: 'ext:夜白神略/audio/character:2',
		init(player) {
			player.equip(game.YB_createCard('ybsl_zhezhiqiang', null, null));
		},
		trigger: {
			player: 'loseAfter',
		},
		filter(event, player) {
			if (event.getParent(1).name == 'equip') {
				return false;
			}
			if (!player.isEmpty(1)) {
				return false;
			}
			return true;
		},
		charlotte: true,
		forced: true,
		content() {
			let num = Math.ceil(Math.random() * 100);
			let suit;
			if (num >= 1 && num <= 24) {
				suit = 'spade';
			}
			if (num >= 25 && num <= 48) {
				suit = 'heart';
			}
			if (num >= 49 && num <= 52) {
				suit = 'none';
			}
			if (num >= 53 && num <= 76) {
				suit = 'club';
			}
			if (num >= 77 && num <= 100) {
				suit = 'diamond';
			}
			player.equip(game.YB_createCard('ybsl_zhezhiqiang', suit, null));
		},
	},
	yb070_meiying: {
		audio: 'ext:夜白神略/audio/character:2',

		group: [/*'yb070_meiying_use',*/ 'yb070_meiying_num', 'yb070_meiying_discard'],
		subSkill: {
			use: {
				audio: 'yb070_meiying',
				trigger: {
					player: ['damageBegin3'],
					source: ['damageBegin1'],
				},
				forced: true,
				filter(event, player) {
					if (player.countMark('yb070_meiying') >= 4) {
						return false;
					}
					return event.card && lib.card[event.card.name];
				},
				content() {
					player.addMark('yb070_meiying');
				},
			},
			num: {
				trigger: { player: 'useCard' },
				forced: true,
				popup: false,
				filter(event, player) {
					let evt = event;
					return ['sha', 'tao'].includes(evt.card.name) && evt.skill == 'yb070_meiying' && evt.cards && evt.cards.length == 2;
				},
				content() {
					trigger.baseDamage++;
				},
			},
			discard: {
				trigger: { player: ['useCardAfter', 'respondAfter'] },
				forced: true,
				popup: false,
				logTarget() {
					return _status.currentPhase;
				},
				autodelay(event) {
					return event.name == 'respond' ? 0.5 : false;
				},
				filter(evt, player) {
					return ['shan', 'wuxie'].includes(evt.card.name) && evt.skill == 'yb070_meiying' && evt.cards && evt.cards.length == 2 && _status.currentPhase && _status.currentPhase != player && _status.currentPhase.countDiscardableCards(player, 'he');
				},
				content() {
					player.line(_status.currentPhase, 'green');
					player.discardPlayerCard(_status.currentPhase, 'he', true);
				},
			},
		},
		enable: ['chooseToUse', 'chooseToRespond'],

		prompt: '将♦️️牌当做雷杀,♥️️牌当做桃,♣️️牌当做闪,♠️️牌当做无懈可击使用或打出',

		viewAs(cards, player) {
			let name = false;
			let nature = null;
			const suit = cards[0].suit;

			switch (suit) {
				case 'club':
					name = 'shan';
					break;
				case 'diamond':
					name = 'sha';
					nature = 'thunder';
					break;
				case 'spade':
					name = 'wuxie';
					break;
				case 'heart':
					name = 'tao';
					break;
			}

			if (name) {
				return { name: name, suit: suit, nature: nature };
			}
			return null;
		},

		check(card) {
			if (ui.selected.cards.length) {
				return 0;
			}
			const player = _status.event.player;
			if (_status.event.type == 'phase') {
				let max = 0;
				let name2;
				let list = ['sha', 'tao'];
				const map = { sha: 'diamond', tao: 'heart' };
				for (let i = 0; i < list.length; i++) {
					let name = list[i];
					if (
						player.countCards('hes', function (card) {
							return (name != 'sha' || get.value(card) < 5) && card.suit == map[name];
						}) > 0 &&
						player.getUseValue({ name: name, nature: name == 'sha' ? 'thunder' : null }) > 0
					) {
						const temp = get.order({ name: name, nature: name == 'sha' ? 'thunder' : null });
						if (temp > max) {
							max = temp;
							name2 = map[name];
						}
					}
				}
				if (name2 == card.suit) {
					return name2 == 'diamond' ? 5 - get.value(card) : 20 - get.value(card);
				}
				return 0;
			}
			return 1;
		},

		selectCard: [1, 2],

		complexCard: true,

		position: 'hes',

		filterCard(card, player, event) {
			if (ui.selected.cards.length) {
				return card.suit == ui.selected.cards[0].suit;
			}
			event = event || _status.event;

			const filter = event._backup.filterCard;

			let name = card.suit;

			if (name == 'club' && filter({ name: 'shan', cards: [card] }, player, event)) {
				return true;
			}

			if (name == 'diamond' && filter({ name: 'sha', cards: [card], nature: 'thunder' }, player, event)) {
				return true;
			}

			if (name == 'spade' && filter({ name: 'wuxie', cards: [card] }, player, event)) {
				return true;
			}

			if (name == 'heart' && filter({ name: 'tao', cards: [card] }, player, event)) {
				return true;
			}

			return false;
		},

		filter(event, player) {
			const filter = event.filterCard;

			if (filter({ name: 'sha', nature: 'thunder' }, player, event) && player.countCards('hes', { suit: 'diamond' })) {
				return true;
			}

			if (filter({ name: 'shan' }, player, event) && player.countCards('hes', { suit: 'club' })) {
				return true;
			}

			if (filter({ name: 'tao' }, player, event) && player.countCards('hes', { suit: 'heart' })) {
				return true;
			}

			if (filter({ name: 'wuxie' }, player, event) && player.countCards('hes', { suit: 'spade' })) {
				return true;
			}
			return false;
		},
		ai: {
			respondSha: true,
			respondShan: true,

			skillTagFilter(player, tag) {
				let name;
				switch (tag) {
					case 'respondSha':
						name = 'diamond';
						break;
					case 'respondShan':
						name = 'club';
						break;
					case 'save':
						name = 'heart';
						break;
				}
				if (player.countMark('yb070_meiying') < 1) {
					return false;
				}
				if (!player.countCards('hes', { suit: name })) {
					return false;
				}
			},

			order(item, player) {
				if (player && _status.event.type == 'phase') {
					let max = 0;
					let list = ['sha', 'tao'];
					const map = { sha: 'diamond', tao: 'heart' };
					for (let i = 0; i < list.length; i++) {
						let name = list[i];
						if (
							player.countCards('hes', function (card) {
								return (name != 'sha' || get.value(card) < 5) && card.suit == map[name];
							}) > 0 &&
							player.getUseValue({ name: name, nature: name == 'sha' ? 'thunder' : null }) > 0
						) {
							const temp = get.order({ name: name, nature: name == 'sha' ? 'thunder' : null });
							if (temp > max) {
								max = temp;
							}
						}
					}
					max /= 1.1;
					return max;
				}
				return 2;
			},
		},

		hiddenCard(player, name) {
			if (name == 'wuxie' && _status.connectMode && player.countCards('hs') > 0) {
				return true;
			}
			if (name == 'wuxie') {
				return player.countCards('hes', { suit: 'spade' }) > 0;
			}
			if (name == 'tao') {
				return player.countCards('hes', { suit: 'heart' }) > 0;
			}
		},
	},
	yb070_fuyi: {
		audio: 'ext:夜白神略/audio/character:2',
		group: ['yb070_fuyi_use', 'yb070_fuyi_die'],
		subSkill: {
			use: {
				enable: 'phaseUse',
				audio: 'yb070_fuyi',
				usable: 1,
				superCharlotte: true,
				charlotte: true,
				content() {
					const skill = player.getSkills()[0];
					player.removeSkill(skill);
					game.log(player, '失去了', get.translation(skill));
					const next = game.createEvent('yb070_fuyi', false);
					next.player = player;
					next.setContent(lib.skill.yb070_fuyi.sword);
				},
			},
			die: {
				trigger: { player: ['dying', 'phaseZhunbei'] },
				audio: 'yb070_fuyi',

				superCharlotte: true,
				charlotte: true,
				content() {
					const skill = player.getSkills()[0];
					player.removeSkill(skill);
					game.log(player, '失去了', get.translation(skill));
					const next = game.createEvent('yb070_fuyi', false);
					next.player = player;
					next.setContent(lib.skill.yb070_fuyi.sword);
				},
			},
		},
		sword() {
			'step 0';
			let list1 = ['shen', 'YB_dream', 'YB_memory'];
			let numa = Math.max(4, game.countPlayer());
			let numb = get.translation('yb070_fuyi');
			const band = ['ybslshen_014liutianyu', 'shen_jiaxu', 'ps_shen_machao'];
			player.YB_fuhan([list1, numa, numb, band, 'all'], 'tw');
			if (player.isMinHp()) {
				player.recover();
			}
		},
	},
	ybsl_zhezhiqiang: {
		charlotte: true,
		equipSkill: true,
		usable: 1,
		enable: ['chooseToUse'],

		filter(event, player) {
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			let name = 'ybsl_nohua';
			if (
				player.getCards('e', function (card) {
					return card.name == 'ybsl_zhezhiqiang';
				})
			) {
				let card = player.getCards('e', function (card) {
					return card.name == 'ybsl_zhezhiqiang';
				});
			}

			if (card) {
				switch (card.suit) {
					case 'club':
						name = 'ybsl_meihua';
						break;
					case 'diamond':
						name = 'ybsl_lanhua';
						break;
					case 'spade':
						name = 'ybsl_zhuzi';
						break;
					case 'heart':
						name = 'ybsl_juhua';
						break;
					case 'none':
						name = 'ybsl_nohua';
						break;
				}
			}

			if (name) {
				return evt({ name: name }, player, event);
			}
		},
		audio: 'zhangba_skill',
		viewAs(cards, player) {
			let name = 'ybsl_nohua';

			if (
				player.getCards('e', function (card) {
					return card.name == 'ybsl_zhezhiqiang';
				})
			) {
				let card = player.getCards('e', function (card) {
					return card.name == 'ybsl_zhezhiqiang';
				});
			}

			if (card) {
				switch (card.suit) {
					case 'club':
						name = 'ybsl_meihua';
						break;
					case 'diamond':
						name = 'ybsl_lanhua';
						break;
					case 'spade':
						name = 'ybsl_zhuzi';
						break;
					case 'heart':
						name = 'ybsl_juhua';
						break;
					case 'none':
						name = 'ybsl_nohua';
						break;
				}
			}

			if (name) {
				return { name: name };
			}
			return null;
		},
		viewAsFilter(player) {
			return true;
		},
		prompt(event, card) {
			let str = '视为使用一张';
			let name = 'ybsl_nohua';
			if (
				_status.event.player.getCards('e', function (card) {
					return card.name == 'ybsl_zhezhiqiang';
				})
			) {
				let card = _status.event.player.getCards('e', function (card) {
					return card.name == 'ybsl_zhezhiqiang';
				});
			}
			if (card) {
				switch (card.suit) {
					case 'club':
						name = 'ybsl_meihua';
						break;
					case 'diamond':
						name = 'ybsl_lanhua';
						break;
					case 'spade':
						name = 'ybsl_zhuzi';
						break;
					case 'heart':
						name = 'ybsl_juhua';
						break;
					case 'none':
						name = 'ybsl_nohua';
						break;
				}
			}
			str += get.translation(name);
			return str;
		},

		position: 'h',
		filterCard: () => false,
		selectCard: -1,
		hiddenCard(player, name) {
			if (name == 'ybsl_juhua') {
				return true;
			}
			if (name == 'ybsl_wuhua') {
				return true;
			}
		},
	},

	ybsl_xinghen: {
		mod: {
			maxHandcard(player, num) {
				let i = player.storage.ybsl_xinghen;
				if (i > 5) {
					i = 5;
				}
				return i + num;
			},
		},
		intro: {
			content: 'mark',
		},
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'phaseDrawBegin2' },

		filter(event, player) {
			return !event.numFixed && player.countMark('ybsl_xinghen') > 0;
		},
		mark: true,
		marktext: '痕',
		forced: true,
		content() {
			let k = player.storage.ybsl_xinghen;
			if (k > 3) {
				k = 3;
			}
			trigger.num += k;
		},
		init(player) {
			player.storage.ybsl_xinghen = 0;
		},
		group: ['ybsl_xinghen_juejing', 'ybsl_xinghen_suilie', 'ybsl_xinghen_baiai'],
		subSkill: {
			juejing: {
				audio: 'ybsl_xinghen',
				trigger: { player: ['dying', 'dyingAfter'] },
				forced: true,
				content() {
					let num = Math.floor(Math.random() * 3) + 1;
					if (get.isLuckyStar(player)) {
						num = 3;
					}
					player.draw(num);
				},
			},
			suilie: {
				audio: 'ybsl_xinghen',
				trigger: {
					player: ['changeHp'],
				},
				forced: true,
				content() {
					event.num = Math.abs(trigger.num);
					player.addMark('ybsl_xinghen', event.num);
				},
			},
			baiai: {
				audio: 'ybsl_xinghen',
				trigger: {
					player: ['phaseJieshuBegin'],
				},
				forced: true,
				filter(event, player) {
					let numb = player.countCards('h') + player.hp;
					if (player.storage.ybsl_xinghen < numb) {
						return false;
					}
					return true;
				},
				content() {
					'step 0';
					player.discard(player.getCards('h'));
					('step 1');
					player.removeMark('ybsl_xinghen', player.countMark('ybsl_xinghen'));
					player.gainMaxHp();
					('step 2');
					const numc = player.maxHp;
					const carde = player.countCards('h');
					player.draw(numc - carde);
				},
			},
		},
	},
	ybsl_cuixing: {
		audio: 'ext:夜白神略/audio/character:1',
		mark: true,
		intro: {
			content(storage, player) {
				let str = '';
				const suit = ['spade', 'heart', 'club', 'diamond'];
				for (let i = 0; i < suit.length; i++) {
					str += '<br>';
					str += get.translation(suit[i]);
					str += '可以转化成';
					let list, list2;
					switch (i) {
						case 0:
							list = player.storage.ybsl_cuixing_spade;
							list2 = player.storage.ybsl_cuixing_ban_spade;
							break;
						case 1:
							list = player.storage.ybsl_cuixing_heart;
							list2 = player.storage.ybsl_cuixing_ban_heart;
							break;
						case 2:
							list = player.storage.ybsl_cuixing_club;
							list2 = player.storage.ybsl_cuixing_ban_club;
							break;
						case 3:
							list = player.storage.ybsl_cuixing_diamond;
							list2 = player.storage.ybsl_cuixing_ban_diamond;
							break;
					}
					for (let j = 0; j < list.length; j++) {
						if (j != 0) {
							str += '、';
						}
						if (list2.includes(list[j])) {
							str += '<span style="text-decoration: line-through;">' + get.translation(list[j]) + '</span>';
						} else {
							str += get.translation(list[j]);
						}
					}
				}
				return str;
			},
		},
		group: ['ybsl_cuixing_spade', 'ybsl_cuixing_heart', 'ybsl_cuixing_club', 'ybsl_cuixing_diamond'],
		derivation: ['ybsl_cuixing_spade', 'ybsl_cuixing_heart', 'ybsl_cuixing_club', 'ybsl_cuixing_diamond'],
		init(player) {
			player.storage.ybsl_cuixing_spade = ['wuxie'];
			player.storage.ybsl_cuixing_heart = ['tao'];
			player.storage.ybsl_cuixing_club = ['shan'];
			player.storage.ybsl_cuixing_diamond = ['sha'];
			player.storage.ybsl_cuixing_ban_spade = [];
			player.storage.ybsl_cuixing_ban_heart = [];
			player.storage.ybsl_cuixing_ban_club = [];
			player.storage.ybsl_cuixing_ban_diamond = [];
			player.storage.ybsl_cuixing_list = [];
		},
		getCuixing(player) {
			return ['faraway_spade', 'faraway_heart', 'faraway_club', 'faraway_diamond'];
		},
		levelUpFilter(player) {
			return true;
		},
		levelUp(player) {
			const next = game.createEvent('ybsl_cuixing_change', false);
			next.player = player;
			next.setContent(lib.skill.ybsl_cuixing.upc);
		},

		upc() {
			'step 0';
			let list = lib.skill.ybsl_cuixing.getCuixing(player);
			const list66 = [];
			for (const i of lib.inpile) {
				const type = get.type(i);
				if (['trick', 'basic', 'ybsl_flower'].includes(type) && !player.storage.ybsl_cuixing_list.includes(i)) {
					list66.push(i);
				}
			}

			const next = player.chooseToMove('淬星:请选择要新增的牌名');
			next.set('list', [
				[
					'♠️️️/♥️️️/♣️️️/♦️️️',
					[list, 'vcard'],
					function (list) {
						let list2 = list.map(function (i) {
							return get.translation(i[2]);
						});
						return '<span class=YB_snowtext>♠️️️新增' + list2[0] + '可转化;</span><span class=yellowtext>♥️️️新增' + list2[1] + '可转化;</span><br><span class=YB_darktext>♣️️️新增' + list2[2] + '可转化;</span><span class=firetext>♦️️️新增' + list2[3] + '可转化.</span><br>请不要为♠️️️赋予无懈,为♥️️️赋予桃,为♣️️️赋予闪,为♦️️️赋予杀,不仅是无事发生,而是会出大问题';
					},
				],
				["操作方法:从下方选择你想要的目标牌,然后替换你要赋予的花色.操作结算时,会根据你选择的牌名对该花色进行添加.<br>此操作本质上是读取此格内牌名的序列,按照♠️️️,♥️️️,♣️️️,♦️️️的顺序依次读取,故而想要不为这个花色赋予时,可以把自带的花色图案放在那里卡位,那玩意不会被读取.<br><span style='color: #fff600'>请勿在此界面托管,否则ai不会进行任何操作,并直接确认</span><br>——感谢Angel大佬撰写的ai框架,并顺手让这个框只能替换而不能移动", [list66, 'vcard']],
			]);
			next.set('filterMove', function (from, to) {
				return typeof to != 'number';
			});
			next.processAI = function (list) {
				const suits = list[0][1][0],
					player = _status.event.player,
					names = list[1][1][0];
				const suit = suits;
				let name = names;

				if (name.includes('tao')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'tao') {
							let num = i;
						}
					}
					name[num] = suit[0];
					suit[0] = 'tao';
				} else if (name.includes('ybsl_juhua')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'ybsl_juhua') {
							let num = i;
						}
					}
					name[num] = suit[0];
					suit[0] = 'ybsl_juhua';
				} else {
					let i = name.length;
					const cardname = name.randomGets(1);
					while (i--) {
						if (name[i] === cardname[0]) {
							let num = i;
						}
					}
					name[num] = suit[0];
					suit[0] = cardname[0];
				}
				if (name.includes('wuxie')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'wuxie') {
							let num = i;
						}
					}
					name[num] = suit[1];
					suit[1] = 'wuxie';
				} else if (name.includes('zhujinqiyuan')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'zhujinqiyuan') {
							let num = i;
						}
					}
					name[num] = suit[1];
					suit[1] = 'zhujinqiyuan';
				} else {
					let i = name.length;
					const cardname = name.randomGets(1);
					while (i--) {
						if (name[i] === cardname[0]) {
							let num = i;
						}
					}
					name[num] = suit[1];
					suit[1] = cardname[0];
				}
				if (name.includes('ybsl_lanhua')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'ybsl_lanhua') {
							let num = i;
						}
					}
					name[num] = suit[2];
					suit[2] = 'ybsl_lanhua';
				} else if (name.includes('zengbingjianzao')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'zengbingjianzao') {
							let num = i;
						}
					}
					name[num] = suit[2];
					suit[2] = 'zengbingjianzao';
				} else {
					let i = name.length;
					const cardname = name.randomGets(1);
					while (i--) {
						if (name[i] === cardname[0]) {
							let num = i;
						}
					}
					name[num] = suit[2];
					suit[2] = cardname[0];
				}
				if (name.includes('sadouchengbing')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'sadouchengbing') {
							let num = i;
						}
					}
					name[num] = suit[3];
					suit[3] = 'sadouchengbing';
				} else if (name.includes('dongzhuxianji')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'dongzhuxianji') {
							let num = i;
						}
					}
					name[num] = suit[3];
					suit[3] = 'dongzhuxianji';
				} else if (name.includes('wuzhong')) {
					let i = name.length;
					while (i--) {
						if (name[i] === 'wuzhong') {
							let num = i;
						}
					}
					name[num] = suit[3];
					suit[3] = 'wuzhong';
				} else {
					let i = name.length;
					const cardname = name.randomGets(1);
					while (i--) {
						if (name[i] === cardname[0]) {
							let num = i;
						}
					}
					name[num] = suit[3];
					suit[3] = cardname[0];
				}

				const suit1 = suit.map((Angel) => ['', '', Angel]);
				let name1 = name.map((Angel) => ['', '', Angel]);
				return [suit1, name1];
			};

			event.list = list;

			('step 1');
			if (result.bool) {
				let list = ['faraway_spade', 'faraway_heart', 'faraway_club', 'faraway_diamond'],
					list2 = result.moved[0].map(function (i) {
						return i[2];
					});
				for (let i = 0; i < 4; i++) {
					if (!list.includes(list2[i])) {
						switch (i) {
							case 0:
								player.storage.ybsl_cuixing_spade.push(list2[i]);
								break;
							case 1:
								player.storage.ybsl_cuixing_heart.push(list2[i]);
								break;
							case 2:
								player.storage.ybsl_cuixing_club.push(list2[i]);
								break;
							case 3:
								player.storage.ybsl_cuixing_diamond.push(list2[i]);
								break;
						}
						player.storage.ybsl_cuixing_list.push(list2[i]);
					}
				}
				let str = '#g';
				for (let j = 0; j < 4; j++) {
					str += get.translation(list2[j]);
					if (j != 3) {
						str += '/';
					}
				}
				game.log(player, '#g【淬星】', '各花色依次新增', str);
			}
		},
		subSkill: {
			spade: {
				audio: 'ext:夜白神略/audio/character:1',
				enable: ['chooseToUse', 'chooseToRespond'],
				filter(event, player) {
					if (player.countCards('hes', { suit: 'spade' }) < 1) {
						return false;
					}
					let evt = lib.filter.filterCard;
					if (event.filterCard) {
						evt = event.filterCard;
					}
					let list1 = [];
					for (const i of player.storage.ybsl_cuixing_spade) {
						if (!player.storage.ybsl_cuixing_ban_spade.includes(i)) {
							list1.push(i);
						}
					}
					for (let k of list1) {
						if (evt({ name: k }, player, event)) {
							return true;
						}
					}
					return false;
				},
				chooseButton: {
					dialog(event, player) {
						let list = [];
						let list2 = player.storage.ybsl_cuixing_spade;
						for (let i = 0; i < list2.length; i++) {
							if (!player.storage.ybsl_cuixing_ban_spade.includes(list2[i])) {
								list.push(['淬星', '', list2[i], 'ice']);
							}
						}
						return ui.create.dialog('淬星♠️️️', [list, 'vcard']);
					},
					filter(button, player) {
						return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
					},
					check(button) {
						if (_status.event.parent.type != 'phase') {
							return 1;
						}
						const player = _status.event.player;
						if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) {
							return 0;
						}
						return player.getUseValue({
							name: button.link[2],
							nature: button.link[3],
						});
					},
					backup(links, player) {
						return {
							filterCard(card, player) {
								const suit = card.suit;
								if (suit != 'spade') {
									return false;
								}
								return true;
							},
							selectCard: [1, 2],
							complexCard: true,
							position: 'hes',
							audio: 'ybsl_cuixing_spade',
							popname: true,
							viewAs: { name: links[0][2], nature: links[0][3], suit: 'spade' },
							precontent() {
								'step 0';
								('step 1');
								let name = event.result.card.name;
								player.addTempSkill('ybsl_cuixing_ban');
								if (name != 'wuxie') {
									player.storage.ybsl_cuixing_ban_spade.push(name);
								}
							},
						};
					},
					prompt(links, player) {
						return '将一至两张♠️️️牌当作冰属性' + get.translation(links[0][2]) + '使用';
					},
				},
				hiddenCard(player, name) {
					return player.storage.ybsl_cuixing_spade.includes(name) && player.countCards('hes') >= 1;
				},
				ai: {
					fireAttack: true,
					respondSha: true,
					respondShan: true,
					skillTagFilter(player) {
						if (player.countCards('hes') < 1) {
							return false;
						}
					},
					order: 1,
					result: {
						player(player) {
							if (_status.event.dying) {
								return get.attitude(player, _status.event.dying);
							}
							return 1;
						},
					},
				},
			},
			heart: {
				audio: 'ext:夜白神略/audio/character:1',
				enable: ['chooseToUse', 'chooseToRespond'],
				filter(event, player) {
					if (player.countCards('hes', { suit: 'heart' }) < 1) {
						return false;
					}
					let evt = lib.filter.filterCard;
					if (event.filterCard) {
						evt = event.filterCard;
					}
					let list1 = [];
					for (const i of player.storage.ybsl_cuixing_heart) {
						if (!player.storage.ybsl_cuixing_ban_heart.includes(i)) {
							list1.push(i);
						}
					}
					for (let k of list1) {
						if (evt({ name: k }, player, event)) {
							return true;
						}
					}
					return false;
				},
				chooseButton: {
					dialog(event, player) {
						let list = [];
						let list2 = player.storage.ybsl_cuixing_heart;
						for (let i = 0; i < list2.length; i++) {
							if (!player.storage.ybsl_cuixing_ban_heart.includes(list2[i])) {
								list.push(['淬星', '', list2[i], 'YB_blood']);
							}
						}
						return ui.create.dialog('淬星♥️️️', [list, 'vcard']);
					},
					filter(button, player) {
						return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
					},
					check(button) {
						if (_status.event.parent.type != 'phase') {
							return 1;
						}
						const player = _status.event.player;
						if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) {
							return 0;
						}
						return player.getUseValue({
							name: button.link[2],
							nature: button.link[3],
						});
					},
					backup(links, player) {
						return {
							filterCard(card, player) {
								const suit = card.suit;
								if (suit != 'heart') {
									return false;
								}
								return true;
							},
							selectCard: [1, 2],
							complexCard: true,
							position: 'hes',
							audio: 'ybsl_cuixing_heart',
							popname: true,
							viewAs: { name: links[0][2], nature: links[0][3], suit: 'heart' },
							precontent() {
								'step 0';
								('step 1');
								let name = event.result.card.name;
								player.addTempSkill('ybsl_cuixing_ban');
								if (name != 'tao') {
									player.storage.ybsl_cuixing_ban_heart.push(name);
								}
							},
						};
					},
					prompt(links, player) {
						return '将一至两张♥️️️牌当作血属性' + get.translation(links[0][2]) + '使用';
					},
				},
				hiddenCard(player, name) {
					return player.storage.ybsl_cuixing_heart.includes(name) && player.countCards('hes') >= 1;
				},
				ai: {
					fireAttack: true,
					respondSha: true,
					respondShan: true,
					skillTagFilter(player) {
						if (player.countCards('hes') < 1) {
							return false;
						}
					},
					order: 1,
					result: {
						player(player) {
							if (_status.event.dying) {
								return get.attitude(player, _status.event.dying);
							}
							return 1;
						},
					},
				},
			},
			club: {
				audio: 'ext:夜白神略/audio/character:1',
				enable: ['chooseToUse', 'chooseToRespond'],
				filter(event, player) {
					if (player.countCards('hes', { suit: 'club' }) < 1) {
						return false;
					}
					let evt = lib.filter.filterCard;
					if (event.filterCard) {
						evt = event.filterCard;
					}
					let list1 = [];
					for (const i of player.storage.ybsl_cuixing_club) {
						if (!player.storage.ybsl_cuixing_ban_club.includes(i)) {
							list1.push(i);
						}
					}
					for (let k of list1) {
						if (evt({ name: k }, player, event)) {
							return true;
						}
					}
					return false;
				},
				chooseButton: {
					dialog(event, player) {
						let list = [];
						let list2 = player.storage.ybsl_cuixing_club;
						for (let i = 0; i < list2.length; i++) {
							if (!player.storage.ybsl_cuixing_ban_club.includes(list2[i])) {
								list.push(['淬星', '', list2[i], 'thunder']);
							}
						}
						return ui.create.dialog('淬星♣️️️', [list, 'vcard']);
					},
					filter(button, player) {
						return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
					},
					check(button) {
						if (_status.event.parent.type != 'phase') {
							return 1;
						}
						const player = _status.event.player;
						if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) {
							return 0;
						}
						return player.getUseValue({
							name: button.link[2],
							nature: button.link[3],
						});
					},
					backup(links, player) {
						return {
							filterCard(card, player) {
								const suit = card.suit;
								if (suit != 'club') {
									return false;
								}
								return true;
							},
							selectCard: [1, 2],
							complexCard: true,
							position: 'hes',
							audio: 'ybsl_cuixing_club',
							popname: true,
							viewAs: { name: links[0][2], nature: links[0][3], suit: 'club' },
							precontent() {
								'step 0';
								('step 1');
								let name = event.result.card.name;
								player.addTempSkill('ybsl_cuixing_ban');
								if (name != 'shan') {
									player.storage.ybsl_cuixing_ban_club.push(name);
								}
							},
						};
					},
					prompt(links, player) {
						return '将一至两张♣️️️牌当作雷属性' + get.translation(links[0][2]) + '使用';
					},
				},
				hiddenCard(player, name) {
					return player.storage.ybsl_cuixing_club.includes(name) && player.countCards('hes') >= 1;
				},
				ai: {
					fireAttack: true,
					respondSha: true,
					respondShan: true,
					skillTagFilter(player) {
						if (player.countCards('hes') < 1) {
							return false;
						}
					},
					order: 1,
					result: {
						player(player) {
							if (_status.event.dying) {
								return get.attitude(player, _status.event.dying);
							}
							return 1;
						},
					},
				},
			},
			diamond: {
				audio: 'ext:夜白神略/audio/character:1',
				enable: ['chooseToUse', 'chooseToRespond'],
				filter(event, player) {
					if (player.countCards('hes', { suit: 'diamond' }) < 1) {
						return false;
					}
					let evt = lib.filter.filterCard;
					if (event.filterCard) {
						evt = event.filterCard;
					}
					let list1 = [];
					for (const i of player.storage.ybsl_cuixing_diamond) {
						if (!player.storage.ybsl_cuixing_ban_diamond.includes(i)) {
							list1.push(i);
						}
					}
					for (let k of list1) {
						if (evt({ name: k }, player, event)) {
							return true;
						}
					}
					return false;
				},
				chooseButton: {
					dialog(event, player) {
						let list = [];
						let list2 = player.storage.ybsl_cuixing_diamond;
						for (let i = 0; i < list2.length; i++) {
							if (!player.storage.ybsl_cuixing_ban_diamond.includes(list2[i])) {
								list.push(['淬星', '', list2[i], 'fire']);
							}
						}
						return ui.create.dialog('淬星♦️️️', [list, 'vcard']);
					},
					filter(button, player) {
						return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
					},
					check(button) {
						if (_status.event.parent.type != 'phase') {
							return 1;
						}
						const player = _status.event.player;
						if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) {
							return 0;
						}
						return player.getUseValue({
							name: button.link[2],
							nature: button.link[3],
						});
					},
					backup(links, player) {
						return {
							filterCard(card, player) {
								const suit = card.suit;
								if (suit != 'diamond') {
									return false;
								}
								return true;
							},
							selectCard: [1, 2],
							complexCard: true,
							position: 'hes',
							audio: 'ybsl_cuixing_diamond',
							popname: true,
							viewAs: { name: links[0][2], nature: links[0][3], suit: 'diamond' },
							precontent() {
								'step 0';
								('step 1');
								let name = event.result.card.name;
								player.addTempSkill('ybsl_cuixing_ban');
								if (name != 'sha') {
									player.storage.ybsl_cuixing_ban_diamond.push(name);
								}
							},
						};
					},
					prompt(links, player) {
						return '将一至两张♦️️️牌当作火属性' + get.translation(links[0][2]) + '使用';
					},
				},
				hiddenCard(player, name) {
					return player.storage.ybsl_cuixing_diamond.includes(name) && player.countCards('hes') >= 1;
				},
				ai: {
					fireAttack: true,
					respondSha: true,
					respondShan: true,
					skillTagFilter(player) {
						if (player.countCards('hes') < 1) {
							return false;
						}
					},
					order: 1,
					result: {
						player(player) {
							if (_status.event.dying) {
								return get.attitude(player, _status.event.dying);
							}
							return 1;
						},
					},
				},
			},
			change: {},
			ban: {
				forced: true,
				content() {
					player.storage.ybsl_cuixing_ban_spade = [];
					player.storage.ybsl_cuixing_ban_heart = [];
					player.storage.ybsl_cuixing_ban_club = [];
					player.storage.ybsl_cuixing_ban_diamond = [];
				},
				onremove(player) {
					player.storage.ybsl_cuixing_ban_spade = [];
					player.storage.ybsl_cuixing_ban_heart = [];
					player.storage.ybsl_cuixing_ban_club = [];
					player.storage.ybsl_cuixing_ban_diamond = [];
				},
			},
		},
	},
	ybsl_xinghui: {
		audio: 'ext:夜白神略/audio/character:1',
		trigger: { player: ['useCard1', 'respond'] },
		forced: true,
		popup: false,
		filter(event, player) {
			let evt = event;
			return evt.cards && evt.cards.length >= 2;
		},
		content() {
			'step 0';
			event.list = [];

			if (player.storage.ybsl_xinghui2) {
				if (!player.storage.ybsl_xinghui2.includes(trigger.card.name)) {
					event.list.push('应变');
				}
			} else {
				event.list.push('应变');
			}

			event.list.push('摸一');
			event.list.push('cancel2');
			('step 1');
			player.chooseControl(event.list);
			('step 2');
			if (result.control != 'cancel2') {
				if (result.control == '应变') {
					if (!Array.isArray(trigger.temporaryYingbian)) {
						trigger.temporaryYingbian = [];
					}
					trigger.temporaryYingbian.add('force');
					trigger.temporaryYingbian.addArray(get.yingbianEffects());

					player.addTempSkill('yingbian_changeTarget');
					player.addTempSkill('ybsl_xinghui2');
					if (!player.storage.ybsl_xinghui2) {
						player.storage.ybsl_xinghui2 = [];
					}
					player.storage.ybsl_xinghui2.push(trigger.card.name);
				}
				if (result.control == '摸一') {
					player.draw();
				}
			}
		},
	},
	ybsl_xinghui2: { onremove: true },
	ybsl_xingbian: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'gainBegin',
		},
		filter(event, player) {
			const num1 = player.hp + player.maxHp;
			let num2 = player.countCards('h') * 2;
			return num1 > num2 && !player.storage.ybsl_xingbian;
		},
		init(player) {
			player.storage.ybsl_cuixing_spade = ['wuxie'];
			player.storage.ybsl_cuixing_heart = ['tao'];
			player.storage.ybsl_cuixing_club = ['shan'];
			player.storage.ybsl_cuixing_diamond = ['sha'];
			player.storage.ybsl_cuixing_ban_spade = [];
			player.storage.ybsl_cuixing_ban_heart = [];
			player.storage.ybsl_cuixing_ban_club = [];
			player.storage.ybsl_cuixing_ban_diamond = [];
			player.storage.ybsl_cuixing_list = [];
			lib.onwash.push(function () {
				delete player.storage.ybsl_xingbian;
			});
		},
		content() {
			'step 0';
			player.storage.ybsl_xingbian = true;
			if (player.maxHp > 1) {
				player.loseMaxHp();
			}
			('step 1');

			const next = game.createEvent('ybsl_cuixing_change', false);
			next.player = player;
			next.setContent(lib.skill.ybsl_cuixing.upc);
		},
		derivation: 'ybsl_cuixing_change',
	},

	yb072_ezhao: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseBegin',
		},
		forced: true,
		filter(event, player) {
			if (event.player == player) {
				return false;
			}
			return true;
		},
		marktext: '呪',
		intro: {
			content: 'expansion',
			markcount: 'expansion',
		},
		content() {
			'step 0';
			trigger.player.judge();
			('step 1');
			event.card = result.card;
			if (trigger.player.getExpansions('yb072_ezhao_mark').length) {
				const suit = event.card.suit;
				let list = trigger.player.getExpansions('yb072_ezhao_mark');
				game.log(suit, list);
				for (let i = 0; i < list.length; i++) {
					let gogo;
					if (suit == list[i].suit) {
						gogo = true;
					} else if (i == list.length - 1 && gogo != true) {
						trigger.player.addToExpansion(event.card, 'gain2').gaintag.add('yb072_ezhao_mark');
						event.finish();
					} else if (i == list.length - 1 && gogo == true) {
						game.log('成');
						event.goto(2);
					}
				}
			} else {
				trigger.player.addToExpansion(event.card, 'gain2').gaintag.add('yb072_ezhao_mark');
				event.finish();
			}
			('step 2');
			trigger.player
				.chooseControl('是', '否')
				.set('prompt', '是否对其发起投江')
				.set('ai', function () {
					let att = get.attitude(_status.event.player, player);
					if (att < 0) {
						return '是';
					}
					return '否';
				});
			('step 3');
			if (result.control == '否') {
				event.finish();
			} else {
				game.log('因作者水平受限,这里临时改成视为对' + get.translation(player) + '使用一张杀');
				trigger.player.useCard(
					{
						name: 'sha',
						isCard: false,
					},
					player,
					false,
				);
			}
		},
		group: ['yb072_ezhao_mark', 'yb072_ezhao_jie'],
		subSkill: {
			mark: {
				forced: true,
				charlotte: true,
				marktext: '呪',
				intro: {
					content: 'expansion',
					markcount: 'expansion',
				},
			},
			jie: {
				forced: true,
				trigger: {
					global: 'useCard',
				},
				audio: 'yb072_ezhao',
				filter(event, player) {
					if (event.player.getExpansions('yb072_ezhao_mark').length == 0) {
						return false;
					}
					return true;
				},
				content() {
					'step 0';
					event.goto(1);

					('step 1');
					const suit = trigger.cards[0].suit;
					let list = trigger.player.getExpansions('yb072_ezhao_mark');
					for (let i = 0; i < list.length; i++) {
						if (suit == list[i].suit) {
							event.goto(3);
						}
					}
					('step 2');
					event.finish();
					('step 3');
					let list2 = ['无效', '令其摸一', 'cancel2'];
					player
						.chooseControl(list2)
						.set('prompt', get.translation(trigger.player) + '对' + get.translation(trigger.targets) + '使用了' + get.translation(trigger.cards) + ',<br>是否令此牌无效')
						.set('ai', function () {
							let att = get.attitude(_status.event.player, trigger.player);
							if (att < 0) {
								return '无效';
							} else if (att > 0) {
								return '令其摸一';
							} else if (att == 0) {
								return 'cancel2';
							}
						});
					('step 4');
					if (result.control == 'cancel2') {
						event.finish();
					} else if (result.control == '无效') {
						trigger.cancel();
					} else if (result.control == '令其摸一') {
						trigger.player.draw();
					}
				},
				ai: {
					expose: 1,
					threaten: 2,
				},
			},
		},
	},
	yb072_toujiang: {
		up() {
			player
				.chooseTarget()
				.set('prompt', '要把谁投进河里')
				.set('ai', function (target) {
					const player = _status.event.player;
					let att = get.attitude(player, target);
					if (att < 0) {
						att = -Math.sqrt(-att);
					} else {
						att = Math.sqrt(att);
					}
					return att * lib.card.guohe.ai.result.target(player, target);
				});
		},
	},

	ybsl_duanzui: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter: (event, player) => game.hasPlayer((current) => current != player),
		filterTarget: (card, player, target) => target != player,
		content() {
			'step 0';
			if (target.isIn()) {
				if (target.countCards('he') > 0) {
					player.choosePlayerCard(target, 'he', true);
				} else {
					result.cards = get.cards(1);
				}
			}
			('step 1');
			player.showCards(result.cards);
			event.card = result.cards;
			('step 2');
			target.addToExpansion(event.card, 'gain2').gaintag.add('ybsl_duanzui_mark');
			('step 3');
			if (target.maxHp > 1) {
				target.loseMaxHp();
			} else {
				event.finish();
			}
			('step 4');
			player.loseMaxHp();
		},

		mod: {
			targetInRange(card, player, target) {
				if (target.hasMark('ybsl_duanzui_mark')) {
					return true;
				}
			},
		},
		ai: {
			combo: 'ybsl_zhenhun',
			threaten: 3,
			expose: 1,
			order: 2,
			result: {
				target(player, target) {
					if (target.isHealthy()) {
						return -2;
					}
					return -1;
				},
			},
		},
		subSkill: {
			mark: {
				marktext: '§',
				intro: {
					name: '§',
					content: 'expansion',
					markcount: 'expansion',
				},
				mod: {
					maxHandcard(player, num) {
						let numx = player.countMark('ybsl_duanzui_mark');
						if (numx) {
							return (
								num +
								numx *
								game.countPlayer(function (current) {
									return current.hasSkill('ybsl_duanzui');
								})
							);
						}
					},
				},
			},
		},
	},
	ybsl_zhenhun: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'useCardToPlayered' },
		forced: true,
		filter(event, player) {
			if (event.target.getExpansions('ybsl_duanzui_mark').length == 0) {
				return false;
			}
			return true;
		},
		logTarget: 'target',
		content() {
			trigger.directHit.add(trigger.target);
			if (
				player.getHistory('gain', function (evt) {
					return evt.getParent(2).name == 'ybsl_zhenhun';
				}).length < 2
			) {
				player.draw();
			}
		},
		group: ['ybsl_zhenhun_usea', 'ybsl_zhenhun_die'],
		ai: {
			directHit_ai: true,
			skillTagFilter(player, tag, arg) {
				return arg && arg.target && arg.target.hasMark('ybsl_duanzui_mark');
			},
		},
		subSkill: {
			usea: {
				trigger: { source: 'damageSource' },

				usable: 1,
				filter(event, player) {
					if (event.player.getExpansions('ybsl_duanzui_mark').length == 0) {
						return false;
					}
					return true;
				},
				prompt: '是否获得其一张"§"标记？',
				prompt2: '然后你加1点体力上限并摸一张牌',
				content() {
					'step 0';
					event.cards = trigger.player.getExpansions('ybsl_duanzui_mark');
					('step 1');
					player.chooseCardButton(event.cards, true, '镇魂:获得其一张<§>牌').set('ai', function (button) {
						return get.useful(button.link);
					});
					('step 2');
					player.gain(result.links, 'gain2');
					player.gainMaxHp();
					player.draw();
				},
			},
			die: {
				trigger: { global: 'die' },
				forced: true,
				filter(event, player) {
					if (event.player.getExpansions('ybsl_duanzui_mark').length == 0) {
						return false;
					}
					return true;
				},

				content() {
					player.gainMaxHp(trigger.player.getExpansions('ybsl_duanzui_mark').length);
					player.draw(trigger.player.getExpansions('ybsl_duanzui_mark').length);
				},
			},
		},
	},
	ybsl_kunyu: {
		audio: 'ext:夜白神略/audio/character:2',
		mod: {
			maxHandcardBase(player) {
				return player.getDamagedHp();
			},
		},
		trigger: { player: 'damageBegin2' },
		forced: true,
		filter(event, player) {
			return event.source && event.source != player && player.maxHp > 1 && player.countCards('h') > 0;
		},
		content() {
			'step 0';
			player.chooseCardTarget({
				prompt: '请选择【困圄】的牌和目标',
				prompt2: '将一张手牌交给一名其他角色并防止伤害' + (player.hasSkill('ybsl_duanzui') ? ',然后将伤害来源的一张牌置于其武将牌上称为<§>(若其无牌则改为牌堆顶一张牌)' : ''),
				filterCard: true,
				forced: true,
				filterTarget: lib.filter.notMe,
				ai1(card) {
					if (
						get.tag(card, 'recover') &&
						!game.hasPlayer(function (current) {
							return get.attitude(current, player) > 0 && !current.hasSkillTag('nogain');
						})
					) {
						return 0;
					}
					return 1 / Math.max(0.1, get.value(card));
				},
				ai2(target) {
					let player = _status.event.player,
						att = get.attitude(player, target);
					if (target.hasSkillTag('nogain')) {
						att /= 9;
					}
					return 4 + att;
				},
			});
			('step 1');
			if (result.bool) {
				let target = result.targets[0];
				player.line(target, 'green');
				player.give(result.cards, target);
				trigger.cancel();
				player.loseMaxHp();
				if (player.hasSkill('ybsl_duanzui')) {
					event.target = trigger.source;
					event.goto(2);
				} else {
					event.finish();
				}
			}
			('step 2');
			if (event.target.isIn()) {
				if (event.target.countCards('he') > 0) {
					player.choosePlayerCard(event.target, 'he', true);
				} else {
					result.cards = get.cards(1);
				}
			}
			('step 3');
			player.showCards(result.cards);
			event.card = result.cards;
			('step 4');
			event.target.addToExpansion(event.card, 'gain2').gaintag.add('ybsl_duanzui_mark');
		},
	},

	ybsl_guanxing: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	ybsl_tianwen: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	ybsl_guayao: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb075_quanke: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseUseBefore',
		},
		filter(event, player) {
			return event.player != player && event.player.countCards('he') > 1;
		},
		check(event, player) {
			const tar = event.player;
			let att = get.attitude(player, tar);
			if (att <= 0) {
				return tar.countCards('h') < 5;
			} else {
				return tar.countCards('h') > 3;
			}
		},
		content() {
			'step 0';

			trigger.player.chooseCard('he', true, '劝氪:将一张牌交给' + get.translation(player));
			('step 1');
			if (result.bool) {
				trigger.player.showCards(result.cards);
				trigger.player.give(result.cards, player, true);
				trigger.player.storage.yb075_quanke_buff = get.type2(result.cards[0]);
				trigger.player.addTempSkill('yb075_quanke_buff', { player: 'phaseUseAfter' });
			} else {
				event.finish();
			}
		},
	},
	yb075_quanke_buff: {
		trigger: {
			player: 'useCard',
		},
		forced: true,
		filter(event, player, card) {
			return get.type2(event.card) == player.storage.yb075_quanke_buff;
		},
		content() {
			player.draw();
		},
		charlotte: true,
		mark: true,
		marktext: '氪',
		intro: {
			name: '氪金',
			content(storage, player) {
				let str = '本阶段使用';
				str += get.translation(player.storage.yb075_quanke_buff);
				str += '类型牌时摸一张牌';
				return str;
			},
		},
	},
	yb075_wuma: {
		audio: 'ext:夜白神略/audio/character:2',
		init(player, skill) {
			player.disableEquip('equip3');
			player.disableEquip('equip4');
		},
	},
	yb075_qianma: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		filterCard(card, player) {
			return get.subtype(card) == 'equip3' || get.subtype(card) == 'equip4' || get.subtype(card) == 'equip6';
		},
		position: 'hes',
		viewAs: { name: 'wuzhong' },
		viewAsFilter(player) {
			if (
				!player.countCards('hes', function (card) {
					return get.subtype(card) == 'equip3' || get.subtype(card) == 'equip4' || get.subtype(card) == 'equip6';
				})
			) {
				return false;
			}
		},
		prompt: '将一张坐骑牌当无中生有使用',
		check(card) {
			return 4 - get.value(card);
		},
	},

	yb076_suiyan: {
		audio: 'ext:夜白神略/audio/character:2',
		preHidden: true,
		trigger: {
			global: 'phaseUseBefore',
		},
		filter(event, player) {
			return player != event.player && !player.hasSkill('yb076_suiyan_mark');
		},
		content() {
			'step 0';
			trigger.player.draw(2);
			player.addTempSkill('yb076_suiyan_mark', 'roundStart');
			('step 1');
			player.addTempSkill('yb076_suiyan_use');
			player.storage.yb076_suiyan_use = trigger.player;
		},
		subSkill: {
			use: {
				audio: 'yb076_suiyan',
				mark: true,
				intro: {
					content: '本回合$使用非{装备或延时锦囊}后,你可以视为使用一张同样的牌',
				},
				trigger: {
					global: 'useCardAfter',
				},
				filter(event, player) {
					if (!player.storage.yb076_suiyan_use || event.player != player.storage.yb076_suiyan_use) {
						return false;
					}
					if (get.type(event.card) == 'equip' || get.type(event.card) == 'delay') {
						return false;
					}
					return player.hasUseTarget(event.card);
				},
				content() {
					let name = trigger.card.viewAs || trigger.card.name;
					player.chooseUseTarget(get.prompt('yb076_suiyan'), '视为使用一张' + get.translation(trigger.card), {
						name: name,
						nature: trigger.card.nature,
						isCard: false,
					});
				},
			},
			mark: {
				mark: true,
				intro: {
					content: '本轮已发动',
				},
			},
		},
	},
	yb076_zhenlie: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'zhenlie',
	},
	yb076_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb077_shensu: {
		audio: 'yb077_shensu1',
		group: ['yb077_shensu1', 'yb077_shensu2', 'yb077_shensu4'],
	},
	yb077_shensu1: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'phaseJudgeBefore' },
		forced: true,
		content() {
			'step 0';
			const check = player.countCards('h') > 2;
			player
				.chooseTarget(get.prompt('yb077_shensu'), '跳过判定阶段和摸牌阶段,视为对一名其他角色使用一张【杀】', function (card, player, target) {
					if (player == target) {
						return false;
					}
					return player.canUse({ name: 'sha' }, target, false);
				})
				.set('check', check)
				.set('ai', function (target) {
					if (!_status.event.check) {
						return 0;
					}
					return get.effect(target, { name: 'sha' }, _status.event.player);
				})
				.setHiddenSkill('yb077_shensu1');
			('step 1');
			if (result.bool) {
				player.useCard({ name: 'sha' }, result.targets[0], false);
				trigger.cancel();
				player.skip('phaseDraw');
			}
		},
	},
	yb077_shensu2: {
		audio: 'yb077_shensu1',
		trigger: { player: 'phaseUseBefore' },
		forced: true,
		filter(event, player) {
			return (
				player.countCards('he', function (card) {
					if (_status.connectMode) {
						return true;
					}
					return get.type(card) == 'equip';
				}) > 0
			);
		},
		content() {
			'step 0';
			const check = player.needsToDiscard();
			player
				.chooseCardTarget({
					prompt: get.prompt('yb077_shensu'),
					prompt2: '弃置一张装备牌并跳过出牌阶段,视为对一名其他角色使用一张【杀】',
					filterCard(card, player) {
						return get.type(card) == 'equip' && lib.filter.cardDiscardable(card, player);
					},
					position: 'he',
					filterTarget(card, player, target) {
						if (player == target) {
							return false;
						}
						return player.canUse({ name: 'sha' }, target, false);
					},
					ai1(card) {
						if (_status.event.check) {
							return 0;
						}
						return 6 - get.value(card);
					},
					ai2(target) {
						if (_status.event.check) {
							return 0;
						}
						return get.effect(target, { name: 'sha' }, _status.event.player);
					},
					check: check,
				})
				.setHiddenSkill('yb077_shensu2');
			('step 1');
			if (result.bool) {
				player.discard(result.cards[0]);
				player.useCard({ name: 'sha' }, result.targets[0], false);
				trigger.cancel();
			}
		},
	},
	yb077_shensu4: {
		audio: 'yb077_shensu1',
		trigger: { player: 'phaseDiscardBefore' },
		forced: true,
		content() {
			'step 0';
			const check = player.needsToDiscard() || player.isTurnedOver() || (player.hasSkill('shebian') && player.canMoveCard(true, true));
			player
				.chooseTarget(get.prompt('yb077_shensu'), '跳过弃牌阶段并将武将牌翻面,视为对一名其他角色使用一张【杀】', function (card, player, target) {
					if (player == target) {
						return false;
					}
					return player.canUse({ name: 'sha' }, target, false);
				})
				.set('check', check)
				.set('ai', function (target) {
					if (!_status.event.check) {
						return 0;
					}
					return get.effect(target, { name: 'sha' }, _status.event.player, _status.event.player);
				});
			('step 1');
			if (result.bool) {
				player.turnOver();
				player.useCard({ name: 'sha' }, result.targets[0], false);
				trigger.cancel();
			}
		},
	},
	yb077_yingmu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { global: 'useCard1' },
		forced: true,
		firstDo: true,
		filter(event, player) {
			if (!player.isTurnedOver()) {
				return false;
			}
			return event.player != player;
		},
		content() { },
		mod: {
			targetEnabled(card, player, target) {
				if (target.isTurnedOver() && player != target) {
					return false;
				}
			},
		},
	},
	yb077_jibu: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 3,
		trigger: { player: 'useCardAfter' },
		filter(event, player) {
			return !player.getHistory('sourceDamage', function (evt) {
				return evt.card == event.card;
			}).length;
		},
		check() {
			return true;
		},
		forced: true,
		content() {
			player.draw();
		},
	},
	yb077_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb078_yaoyan: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterTarget(card, player, target) {
			if (player == target) {
				return false;
			}
			return target.hasCard((card) => lib.filter.canBeGained(card, target, player), 'he');
		},
		selectTarget: [1, Infinity],
		content() {
			if (target.countGainableCards(player, 'he')) {
				player.gainPlayerCard('he', target, true);
				target.addTempSkill('yb078_yaoyan_add');
			}
		},
		ai: {
			threaten: 1.1,
			expose: 1,
			order: 8,
			result: {
				player(player, target) {
					if (ui.selected.targets.length) {
						return ui.selected.targets.length;
					}
					return 1;
				},
				target(player, target) {
					return 0;
				},
			},
		},
		subSkill: {
			add: {
				forced: true,
				charlotte: true,
				onremove(player) {
					player.draw();
				},
			},
		},
	},
	yb078_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb079_qingnian: {
		audio: 'ext:夜白神略/audio/character:2',
		derivation: 'yb079_yinyong',
	},
	yb079_jinran: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb079_yinyong: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb079_xiuxin: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		trigger: {
			global: ['loseAfter', 'loseAsyncAfter'],
		},
		filter(event, player) {
			if (event.type != 'discard') {
				return false;
			}
			return event.cards && event.cards.length;
		},
		cost() {
			'step 0';
			player.chooseCardButton(get.prompt2('yb079_xiuxin'), trigger.cards).set('ai', function (button) {
				const player = player || _status.event.player;
				return get.value(button.link) + player.maxHp - 5;
			});
			('step 1');
			if (result.bool) {
				event.result = {
					bool: true,
					cost_data: {
						card: result.links[0],
					},
				};
			}
		},
		content() {
			'step 0';
			player.loseMaxHp();
			('step 1');
			player.addToExpansion(event.cost_data.card, 'gain2').gaintag.add('yb079_xiuxin');
			let evt = trigger.getl(player);
			event.cost_data.card.storage.source = trigger.player;
		},
		mark: true,
		marktext: '心',
		intro: {
			mark(dialog, storage, player) {
				if (player.getExpansions('yb079_xiuxin')) {
					dialog.addSmall([player.getExpansions('yb079_xiuxin'), 'card']);
				}
			},
		},
	},
	yb079_newyinyong: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		filter(event, player) {
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			return (
				player.getExpansions('yb079_xiuxin')?.length &&
				player.getExpansions('yb079_xiuxin').filter((card) => {
					if (player.storage.yb079_newyinyong_used && player.storage.yb079_newyinyong_used.includes(card)) {
						return false;
					}
					return evt({ name: card.name }, player, event);
				}).length
			);
		},
		hiddenCard(player, name) {
			return (
				player.getExpansions('yb079_xiuxin')?.length &&
				player.getExpansions('yb079_xiuxin').filter((card) => {
					if (player.storage.yb079_newyinyong_used && player.storage.yb079_newyinyong_used.includes(card)) {
						return false;
					}
					return card.name == name;
				}).length
			);
		},
		chooseButton: {
			dialog(event, player) {
				let cards = player.getExpansions('yb079_xiuxin');
				return ui.create.dialog('吟咏', cards, 'hidden');
			},
			filter(button, player) {
				let card = button.link;
				if (player.storage.yb079_newyinyong_used && player.storage.yb079_newyinyong_used.includes(card)) {
					return false;
				}
				return _status.event.parent.filterCard({ name: card.name }, player, _status.event.parent);
			},
			backup(links, player) {
				const skill = _status.event.buttoned;
				return {
					audio: 'yb079_newyinyong',
					selectCard: 1,
					position: 'he',

					filterCard() {
						return true;
					},
					viewAs: {
						name: links[0].name,
						nature: links[0].nature,
					},
					precontent() {
						event.result.card.storage.source = lib.skill.yb079_newyinyong_backup.card.storage.source;
						player.YB_tempz('yb079_newyinyong_used', lib.skill.yb079_newyinyong_backup.card);
					},
					card: links[0],
				};
			},
			prompt(links, player) {
				return '吟咏:选择 ' + get.translation(links[0]) + '的目标';
			},
		},
		group: ['yb079_newyinyong_useAfter'],
		subSkill: {
			useAfter: {
				trigger: {
					player: ['useCardAfter'],
				},

				charlotte: true,

				filter(event, player) {
					return event.skill == 'yb079_newyinyong_backup';
				},
				cost() {
					event.result = player.chooseTarget(true, '选择一名角色令其摸一张牌<br>如果是' + get.translation(trigger.card.storage.source) + '改为摸两张').forResult();
				},
				content() {
					let num = trigger.card.storage.source == event.targets[0] ? 2 : 1;
					event.targets[0].draw(num);
				},
			},
		},
	},

	yb080_huayu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'die' },
		forced: true,
		forceDie: true,
		filter(event, player) {
			return true;
		},
		content() {
			'step 0';

			event.card = get.cardPile('ybsl_fengqiuhuang', 'field') || game.YB_createCard('ybsl_fengqiuhuang', null, null, null);
			player.chooseTarget(get.prompt2('yb080_huayu'), lib.filter.notMe).set('ai', function (target) {
				return get.attitude(_status.event.player, target);
			});

			('step 1');
			const tar = result.targets[0];
			if (tar) {
				tar.equip(event.card);
			} else {
				ui.discardPile.appendChild(event.card);
			}
		},
		derivation: 'ybsl_fengqiuhuang',
		group: 'yb080_huayu_3',
		subSkill: {
			2: {
				audio: 'yb080_huayu',
				name: '华羽',
				equipSkill: true,
				noHidden: true,
				inherit: 'ybsl_fengqiuhuang',
				filter(event, player) {
					if (!lib.skill.ybsl_fengqiuhuang.filter(event, player)) {
						return false;
					}
					if (player.storage.yb080_niepan) {
						return false;
					}
					if (!player.hasEmptySlot(5)) {
						return false;
					}
					return true;
				},
				ai: {
					effect: {
						player(card, player, target) {
							if (player == target && get.subtype(card) == 'equip5') {
								if (get.equipValue(card) <= 8.5) {
									return 0;
								}
							}
							if (!target.hasEmptySlot(5)) {
								return;
							}
							return lib.skill.ybsl_fengqiuhuang.ai.effect.player.apply(this, arguments);
						},
					},
				},
			},
			3: {
				trigger: {
					global: 'phaseBefore',
					player: 'enterGame',
				},
				forced: true,
				filter(event, player) {
					return event.name != 'phase' || game.phaseNumber == 0;
				},
				content() {
					event.card = game.YB_createCard('ybsl_fengqiuhuang', null, null, null);
					player.equip(event.card);
				},
			},
		},
	},
	yb080_niepan: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		mark: true,
		limited: true,
		init(player) {
			player.storage.yb080_niepan = false;
		},
		filter(event, player) {
			if (player.storage.yb080_niepan) {
				return false;
			}
			if (event.type == 'dying') {
				if (player != event.dying) {
					return false;
				}
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			player.awakenSkill('yb080_niepan');
			player.storage.yb080_niepan = true;
			('step 1');
			player.link(false);
			('step 2');
			player.turnOver(false);
			('step 3');
			if (player.hp < 3) {
				player.recover(3 - player.hp);
			}
			('step 4');
			player.draw(3);
			('step 5');
			player.addSkill('yb080_fengming');
		},
		ai: {
			order: 1,
			skillTagFilter(player, arg, target) {
				if (player != target || player.storage.yb080_niepan) {
					return false;
				}
			},
			save: true,
			result: {
				player(player) {
					if (player.hp <= 0) {
						return 10;
					}
					if (player.hp <= 2 && player.countCards('he') <= 1) {
						return 10;
					}
					return 0;
				},
			},
			threaten(player, target) {
				if (!target.storage.yb080_niepan) {
					return 0.6;
				}
			},
		},
		derivation: 'yb080_fengming',
		intro: {
			content: 'limited',
		},
	},
	yb080_fengming: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['phaseUseSkipped', 'phaseUseCancelled', 'phaseUseAfter'],
		},
		filter(event, player, name) {
			if (name == 'phaseUseAfter') {
				return player.getHistory('useCard').length <= 0;
			}
			return true;
		},
		forced: true,
		content() {
			'step 0';
			let list = ['选项一', '选项二', 'cancel2'];
			let str = '选项一:本回合手牌上限+3;选项二:视为使用一张〖凤鸣九霄〗';
			player
				.chooseControl(list)
				.set('prompt', str)
				.set('ai', function (control) {
					const player = _status.event.player;
					if (
						game.countPlayer(function (current) {
							return current != player && get.attitude(player, current) < 0;
						}) > 0
					) {
						return '选项二';
					}
					return '选项一';
				});
			('step 1');
			if (result.control == '选项一') {
				player.addTempSkill('yb080_fengming_2');
				player.addMark('yb080_fengming_2');
			} else if (result.control == '选项二') {
				player.chooseUseTarget({ name: 'ybsl_fengmingjiuxiao', isCard: false }, true, false);
			}
		},
		derivation: 'ybsl_fengmingjiuxiao',
		subSkill: {
			2: {
				mark: true,
				mod: {
					maxHandcard(player, num) {
						let numb = player.storage.yb080_fengming_2 || 0;
						let numa = 3 * numb;
						return num + numa;
					},
				},
			},
		},
	},

	yb081_lvxin: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb081_shanhui: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb081_sishi: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb081_yinmeng: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb083_shenshou: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb083_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybsl_sanmeng',
	},

	yb047_xundu: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		trigger: { global: 'gainBegin' },
		filter(event, player) {
			if (player.storage.yb047_xundu && player.storage.yb047_xundu.includes(event.player)) {
				return false;
			}
			return event.player != player && !(event.parent.name == 'draw' && event.getParent(2).name == 'phaseDraw');
		},
		init(player) {
			player.storage.yb047_xundu = [];
		},
		check(event, player) {
			if (get.attitude(player, event.player) > 0) {
				return false;
			}
			return true;
		},

		prompt(event, player) {
			let target = event.player;
			return get.translation(target) + '即将获得' + event.cards.length + '张牌,是否发动【寻妒】';
		},
		mark: true,
		intro: {
			content(storage, player) {
				if (storage) {
					return '已对' + get.translation(storage) + '发动过此技能';
				}
			},
		},
		content() {
			'step 0';
			if (!player.storage.yb047_xundu) {
				player.storage.yb047_xundu = [];
			}
			player.storage.yb047_xundu.push(trigger.player);
			event.h = trigger.cards;
			event.cards = player.getCards('h');
			player.showCards(event.h);
			player.$throw(event.h, 1000);
			('step 1');
			player.showCards(event.cards);
			player.$throw(event.cards, 1000);
			event.north = [];
			if (event.cards.length) {
				for (const i of event.cards) {
					const na = i.name;
					for (let t of event.h) {
						const nb = t.name;
						if (na == nb) {
							event.north.add(i);
						}
					}
				}
			}
			('step 2');
			if (event.north.length) {
				player.chooseControl('是', 'cancel2').set('prompt', '是否弃置【' + get.YB_tobo(event.north) + '】,并将选择权交给自己？');
			}
			('step 3');
			let tar, str;
			if (result.control == '是') {
				player.discard(event.north);
				tar = player;
				str = '对';
				str += get.translation(trigger.player);
				str += '造成1点伤害还是获得这些牌';
			} else {
				tar = trigger.player;
				str = '受到';
				str += get.translation(player);
				str += '造成的1点伤害还是改为其获得这些牌';
			}
			tar.chooseControl('伤害', '交牌')
				.set('prompt', str)
				.set('ai', function (control) {
					if (_status.event.player == trigger.player) {
						if (get.attitude(_status.event.player, player) > 0) {
							return '交牌';
						} else if (_status.event.player.hp > 1) {
							return '伤害';
						} else {
							return '交牌';
						}
					} else {
						if (get.attitude(_status.event.player, trigger.player) > 0) {
							return '交牌';
						} else if (trigger.player.hp <= 2) {
							return '伤害';
						} else {
							return '交牌';
						}
					}
				});
			('step 4');
			if (result.control == '交牌') {
				trigger.cancel();
				player.gain(event.h, 'gain2');
			} else {
				trigger.player.damage(1, 'nocard', player);
			}
		},
		ai: {
			threaten: 3,
			expose: 1,
		},
	},
	yb047_efei: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: ['useCard', 'damageEnd'],
		},
		usable: 1,
		filter(event, player, name) {
			if (name == 'useCard') {
				return event.player != player;
			}
			return event.player != player && event.player.isAlive() && event.card && lib.card[event.card.name];
		},
		forced: true,
		content() {
			'step 0';
			let str = '是否弃置一张同名牌,令';
			str += get.translation(trigger.card);
			if (event.triggername == 'useCard') {
				str += '无效？';
			} else {
				str += '追加一次伤害？';
			}
			player
				.chooseCard('he', function (card) {
					const trigger = _status.event.getTrigger();
					if (card.name != trigger.card.name) {
						return false;
					}
					return true;
				})
				.set('ai', function (card) {
					const trigger = _status.event.getTrigger();
					if (get.attitude(_status.event.player, trigger.player) > 0) {
						return false;
					}
					return true;
				})
				.set('prompt', str);
			('step 1');
			if (result.bool) {
				player.discard(result.cards);
			} else {
				player.storage.counttrigger.yb047_efei--;
				event.finish();
			}
			('step 2');
			if (event.triggername == 'useCard') {
				trigger.cancel();
			} else {
				trigger.player.damage(trigger.num, trigger.card, trigger.source, trigger.nature);
			}
		},
		ai: {
			threaten: 3,
			expose: 1,
		},
	},
	yb047_pomen: {
		audio: 'yb047_pomeng',
		trigger: {
			global: 'loseAfter',
		},

		filter(event, player) {
			if (event.type != 'discard') {
				return false;
			}
			if (event.player == player) {
				return false;
			}
			return event.player.isAlive();
		},
		usable: 1,
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCardButton(
					'选择一张令其收回,视为其对自己造成1点由此牌造成的伤害',
					trigger.cards.filter((i) => get.position(i, true) == 'd'),
				)
				.set('ai', function (card) {
					const trigger = _status.event.getTrigger();
					if (get.attitude(_status.event.player, trigger.player) > 0) {
						return false;
					}
					return 6 - get.value(card);
				})
				.forResult();
			event.result.cards = event.result.links;
		},
		async content(event, trigger, player) {
			if (!player.storage.yb047_pomen_card) {
				player.storage.yb047_pomen_card = [];
			}
			player.storage.yb047_pomen_card.add(event.cards[0]);
			await trigger.player.gain(event.cards[0], 'gain2');
			await trigger.player.damage(1, event.cards[0], trigger.player);
		},

		init(player) {
			if (!player.storage.yb047_pomen_card) {
				player.storage.yb047_pomen_card = [];
			}
		},
		ai: {
			threaten: 2,
			expose: 1,
		},
		mark: true,
		intro: {
			mark(dialog, storage, player) {
				dialog.addText('当以下牌致人死亡时,你获得之');
				dialog.addSmall([player.storage.yb047_pomen_card, 'card']);
			},
		},
		group: 'yb047_pomen_die',
		subSkill: {
			die: {
				trigger: {
					global: 'die',
				},
				audio: 'yb047_pomeng',
				filter(event, player) {
					if (!event.getParent(2).card) {
						return false;
					}
					if (player.storage.yb047_pomen_card.includes(event.getParent(2).card)) {
						return true;
					}
					return false;
				},
				forced: true,
				content() {
					player.gain(trigger.getParent(2).card, 'gain2');
				},
			},
		},
	},
	yb047_pomeng: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'loseAfter',
		},

		filter(event, player) {
			if (event.type != 'discard') {
				return false;
			}
			if (event.player == player) {
				return false;
			}
			return event.player.isAlive();
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCardButton(
					'选择一张令其收回,视为其对自己造成1点由此牌造成的伤害',
					trigger.cards.filter((i) => get.position(i, true) == 'd'),
				)
				.set('ai', function (card) {
					const trigger = _status.event.getTrigger();
					if (get.attitude(_status.event.player, trigger.player) > 0) {
						return false;
					}
					return 6 - get.value(card);
				})
				.forResult();
			event.result.cards = event.result.links;
		},
		async content(event, trigger, player) {
			if (!player.storage.yb047_pomen_card) {
				player.storage.yb047_pomen_card = [];
			}
			player.storage.yb047_pomen_card.add(event.cards[0]);
			await trigger.player.gain(event.cards[0], 'gain2');
			await trigger.player.damage(1, event.cards[0], trigger.player);
		},

		init(player) {
			if (!player.storage.yb047_pomen_card) {
				player.storage.yb047_pomen_card = [];
			}
		},
		mark: true,
		intro: {
			mark(dialog, storage, player) {
				dialog.addText('当以下牌致人死亡时,你获得之');
				dialog.addSmall([player.storage.yb047_pomen_card, 'card']);
			},
		},
		group: 'yb047_pomen_die',
		ai: {
			threaten: 4,
			expose: 1,
		},
	},

	yb085_muyuan: {
		trigger: {
			player: ['useCardToTarget'],
		},
		audio: 'ext:夜白神略/audio/character:2',
		check(event, player) {
			return get.attitude(player, event.targets[0]) <= 0;
		},
		filter(event, player) {
			if (event.targets.length != 1) {
				return false;
			}
			if (get.type(event.card) == 'equip') {
				return false;
			}
			return event.player == player && player != event.targets[0];
		},
		content() {
			'step 0';
			player.gainPlayerCard(trigger.targets[0], 'he', true);
			('step 1');
			trigger.targets[0].draw();
		},
	},
	yb085_cibie: {
		audio: 'ext:夜白神略/audio/character:2',
		subSkill: {
			count: {
				trigger: {
					player: 'recoverBegin',
				},
				forced: true,
				silent: true,
				popup: false,
				filter(event, player) {
					if (!event.source) {
						return false;
					}
					if (!player.isDying()) {
						return false;
					}
					return true;
				},
				content() {
					trigger.yb085_cibie = true;
				},
			},
			cibie: {
				mark: true,
				intro: {
					content: 'limited',
				},
				init(player) {
					player.storage.yb085_cibie_cibie = false;
				},
				enable: 'phaseUse',
				filter(event, player) {
					return player.hp > 0 && !player.storage.yb085_cibie_cibie;
				},
				filterTarget(card, player, target) {
					return target != player;
				},
				content: async function (event, trigger, player) {
					let target = event.target;
					player.awakenSkill('yb085_cibie_cibie');
					let numb = player.hp;
					await player.loseHp(numb);
					const result = await target
						.chooseToDiscard('h', numb, (card, player) => {
							return lib.filter.cardDiscardable(card, player);
						})
						.set('ai', function (card) {
							return -get.value(card);
						})
						.forResult();
					if (!result.bool) {
						await target.damage(numb, player);
					}
				},
				ai: {
					result: {
						player(player, target) {
							return game.hasPlayer(function (current) {
								return get.attitude(player, current) > 4 && current.countCards('h', 'tao');
							});
						},
						target(player, target) {
							return -player.hp;
						},
					},
				},
			},
		},
		group: ['yb085_cibie_count', 'yb085_cibie_cibie'],
		trigger: {
			player: 'recoverAfter',
		},

		filter(event, player) {
			if (player.isDying()) {
				return false;
			}
			return event.yb085_cibie == true;
		},
		forced: true,
		content() {
			'step 0';
			player.chooseBool('【辞别】:令其获得技能【慕愿】？').set('ai', function () {
				return get.attitude(player, trigger.source);
			});
			('step 1');
			if (result.bool) {
				trigger.source.addSkill('yb085_muyuan');
			} else {
				event.finish();
			}
		},
	},

	yb086_jieyin: {
		audio: 'ext:夜白神略/audio/character:6',
		logAudio: () => 2,
		dutySkill: true,
		usable: 1,
		enable: 'phaseUse',
		filter(event, player) {
			if (_status.yb086_jieyin) {
				for (const i of _status.yb086_jieyin) {
					if (i[0] == player || i[1] == player) {
						return false;
					}
				}
			}
			return !player.choubanhunli;
		},
		filterTarget(card, player, target) {
			if (_status.yb086_jieyin) {
				for (const i of _status.yb086_jieyin) {
					if (i[0] == target || i[1] == target) {
						return false;
					}
				}
			}
			return !target.choubanhunli;
		},
		derivation: 'yb086_zuiyuan',
		selectTarget: 1,
		async content(event, trigger, player) {
			let target = event.target;
			const result = await target
				.chooseBool(get.translation(player) + '想你请求结姻,是否同意？')
				.set('ai', function () {
					if (get.attitude(player, target) > 5) {
						return true;
					}
					return false;
				})
				.forResult();
			if (result.bool) {
				await target.logSkill('yb086_jieyin_ok', player);
				player.choubanhunli = target;
				target.choubanhunli = player;
				player.storage.hunlizijin = 0;
				player.storage.choubanshijian = 0;
				await player.markSkill('yb086_jieyin_ok');
				await player.markSkill('yb086_jieyin_hunlijishi');
				await target.addSkill('yb086_jieyin_choubanhunli');
			}
		},
		ai: {
			order: 10,
			result: {
				player(player, target) {
					return get.attitude(player, target) - 5;
				},
				target: 10,
			},
		},
		group: ['yb086_jieyin_achieve', 'yb086_jieyin_fail', 'yb086_jieyin_hunlijishi'],
		subSkill: {
			ok: {
				mark: true,
				marktext: '婚',
				intro: {
					markcount(storage, player) {
						return player.storage.hunlizijin;
					},
					content(storage, player) {
						return '婚礼资金:' + player.storage.hunlizijin;
					},
				},
			},
			hunlijishi: {
				forced: true,
				trigger: {
					global: ['roundStart'],
				},
				filter(event, player) {
					return player.storage.choubanshijian && player.storage.choubanshijian >= 0;
				},
				content() {
					'step 0';
					player.storage.choubanshijian++;
					('step 1');
					trigger.trigger('yb086_jieyin_choubanshijian');
				},
				mark: true,
				marktext: '筹',
				intro: {
					markcount(storage, player) {
						return player.storage.choubanshijian || 0;
					},
				},
			},
			choubanhunli: {
				audio: 'yb086_jieyin',
				logAudio(event, player) {
					return ['ext:夜白神略/audio/yb086_jieyin3.mp3', 'ext:夜白神略/audio/yb086_jieyin4.mp3'];
				},
				trigger: {
					global: ['loseAfter'],
				},

				enable: 'phaseUse',
				filter(event, player, name) {
					if (name && name == 'loseAfter') {
						if (event.type != 'discard') {
							return false;
						}
						return player.choubanhunli && player.choubanhunli.isIn() && (event.player == player || event.player == player.choubanhunli);
					} else {
						return true;
					}
				},
				selectCard: 1,
				filterCard() {
					return true;
				},
				position: 'he',
				check(card) {
					return get.value(card) <= 6.5;
				},
				discard: false,
				cost() {
					event.result = trigger.player
						.chooseBool('是否出售这些牌？<br>' + get.translation(trigger.cards))
						.set('ai', function () {
							return true;
						})
						.forResult();
				},
				content() {
					let cards = event.triggername ? trigger.cards : event.cards;
					const player2 = player.hasSkill('yb086_jieyin') ? player : player.choubanhunli;
					for (const i of cards) {
						game.log(trigger.player, '出售了', i);
						player2.addToExpansion(i).gaintag.add('yb086_jieyin');
						player2.storage.hunlizijin += get.cardNameLength(i);
						trigger.trigger('yb086_jieyin_choubanhunli');
					}
				},
			},
			achieve: {
				audio: 'yb086_jieyin',
				logAudio(event, player) {
					return ['ext:夜白神略/audio/yb086_jieyin5.mp3'];
				},

				trigger: {
					player: 'yb086_jieyin_choubanhunli',
				},
				filter(event, player) {
					return player.storage.hunlizijin >= 18;
				},
				forced: true,

				content() {
					'step 0';
					player.$skill('婚礼筹办成功');
					event.target = player.choubanhunli;
					('step 1');
					player.awakenSkill('yb086_jieyin');
					delete player.choubanhunli;
					delete event.target.choubanhunli;
					delete player.storage.choubanshijian;
					player.unmarkSkill('yb086_jieyin_ok');
					player.unmarkSkill('yb086_jieyin_hunlijishi');
					event.target.removeSkill('yb086_jieyin_choubanhunli');
					('step 2');
					if (!_status.yb086_jieyin) {
						_status.yb086_jieyin = [];
					}
					_status.yb086_jieyin.push([player, event.target]);
					player.markSkill('yb086_jieyin_banlv');
					event.target.markSkill('yb086_jieyin_banlv');
					('step 3');
					player.gainMaxHp();
					event.target.gainMaxHp();
					('step 4');
					player.addSkill('yb086_zuiyuan');
					event.target.addSkill('yb086_zuiyuan');
					('step 5');
					delete player.storage.hunlizijin;
					let cards = player.getExpansions('yb086_jieyin');
					player.lose(cards, ui.discardPile, 'visible');
					game.log(player, '将', cards, '置入了弃牌堆');
				},
			},
			fail: {
				audio: 'yb086_jieyin',
				logAudio(event, player) {
					return ['ext:夜白神略/audio/yb086_jieyin6.mp3'];
				},
				trigger: {
					player: ['yb086_jieyin_choubanshijian'],
					global: ['dieEnd'],
				},
				filter(event, player, name) {
					if (name == 'dieEnd') {
						return player.choubanhunli && (event.player == player || event.player == player.choubanhunli);
					} else {
						return player.storage.choubanshijian && player.storage.choubanshijian > 3;
					}
				},
				forced: true,
				forceDie: true,
				async content(event, trigger, player) {
					let target = player;
					const player2 = player.choubanhunli;
					await player.$skill('婚礼筹办失败');
					await player.awakenSkill('yb086_jieyin');
					delete player.choubanhunli;
					delete player2.choubanhunli;
					delete player.storage.hunlizijin;
					delete player.storage.choubanshijian;
					await player.unmarkSkill('yb086_jieyin_ok');
					await player.unmarkSkill('yb086_jieyin_hunlijishi');
					await player2.removeSkill('yb086_jieyin_choubanhunli');
					if (event.triggername == 'dieEnd') {
						if (trigger.player == player) {
							target = player.choubanhunli;
						}
						if (player.getExpansions('yb086_jieyin').length) {
							const relu = await target.chooseBool('是否赎回出售的牌？').forResult();
							if (relu.bool) {
								await target.gain(player.getExpansions('yb086_jieyin'), 'gain2');
							}
						}
					} else {
						let list = ['赎回卡牌', '重新择偶'];
						const relu = await target
							.chooseControl(list, true)
							.set('ai', function (control) {
								return '重新择偶';
							})
							.forResult();
						if (relu.control == '赎回卡牌') {
							if (player.getExpansions('yb086_jieyin').length) {
								await target.gain(player.getExpansions('yb086_jieyin'), 'gain2');
							}
						} else {
							if (player.getExpansions('yb086_jieyin').length) {
								let cards = player.getExpansions('yb086_jieyin');
							}
							await player.restoreSkill('yb086_jieyin');
							if (cards) {
								await player.lose(cards, ui.discardPile, 'visible');
								game.log(player, '将', cards, '置入了弃牌堆');
							}
						}
					}
				},
			},
			banlv: {
				charlotte: true,
				mark: true,
				marktext: '婚',
				intro: {
					content(storage, player) {
						if (_status.yb086_jieyin) {
							for (const i of _status.yb086_jieyin) {
								if (i[0] == player || i[1] == player) {
									let target = i[0] == player ? i[1] : i[0];
									return '你和' + get.translation(target) + '组成<结姻伴侣>';
								}
							}
						} else {
							return;
						}
					},
				},
			},
		},
	},
	yb086_zuiyuan: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			if (
				player.getCards('he', function (card) {
					return card.hasGaintag('yb086_zuiyuan');
				}).length
			) {
				return false;
			}
			return player.countCards('he') >= 2;
		},
		selectCard: 2,
		filterCard(card, player) {
			return player.getDiscardableCards(player, 'he').includes(card);
		},
		position: 'he',
		filterTarget(card, player, target) {
			return player != target;
		},
		selectTarget: 1,
		async content(event, trigger, player) {
			let target = event.target;
			async function jiaohe(player, target) {
				await target.recover();
				let num = Math.min(target.hp, 5);
				const draw = player.draw(num);
				draw.gaintag = ['yb086_zuiyuan'];
				await draw;
			}
			await jiaohe(player, target);
			if (_status.yb086_jieyin) {
				for (const i of _status.yb086_jieyin) {
					if (i[0] == player || i[1] == player) {
						const target2 = i[0] == player ? i[1] : i[0];
						if (target == target2) {
							const result = await target
								.chooseToDiscard('he', '弃置两张牌与' + get.translation(player) + '嬉戏？', 2)
								.set('ai', function (card) {
									if (get.attitude(target, player)) {
										return 10 - get.value(card);
									}
								})
								.forResult();
							if (result.cards) {
								await jiaohe(target, player);
							}
						}
					}
				}
			}
		},
		check(card) {
			return 10 - get.value(card);
		},
		ai: {
			order: 1,
			result: {
				player(player, target) {
					if (_status.yb086_jieyin) {
						for (const i of _status.yb086_jieyin) {
							if (i[0] == player || i[1] == player) {
								let target = i[0] == player ? i[1] : i[0];
								return get.attitude(player, target);
							}
						}
					}
				},
				target: 5,
			},
		},
	},

	yb087_qiujiao: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb092_biyue: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'yb001_wanyue',
	},
	yb092_xiuhua: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'turnOverEnd' },
		filter(event, player) {
			return !player.isTurnedOver();
		},
		forced: true,
		logTarget: (event, player) => game.filterPlayer((current) => current != player && current.inRange(player)).sortBySeat(),
		async content(event, trigger, player) {
			for (let target of event.targets) {
				player.line(target, 'YB_snow');
				const card1 = (await target.chooseToDiscard('he', true, 'chooseonly').forResult()).cards[0];
				const pos1 = get.position(card1);
				await target.discard(card1);
				const card2 = (
					await target
						.chooseToDiscard('he', true, 'chooseonly')
						.set('ai', (card) => {
							const pos = get.event().pos;
							if (get.position(card) != pos) {
								return -get.value(card);
							}
							return player.getCards(pos).reduce((a, b) => a - get.value(b), 0);
						})
						.set('pos', pos1)
						.forResult()
				).cards[0];
				const pos2 = get.position(card2);
				await target.discard(card2);
				if (pos1 == pos2) {
					player.line(target, 'YB_snow');
					await target.discard(target.getCards(pos1));
				}
			}
		},
	},
	yb092_chenyu: {
		mod: {
			aiValue(player, card, num) {
				if (_status.yb092_chenyu) {
					return;
				}
				const evt = get.event();
				if (evt.yb092_chenyu) {
					return num - 2 * evt.yb092_chenyu.includes(card);
				}
				if (evt.name != 'chooseToDiscard') {
					return;
				}
				const dnum = evt.selectCard[0],
					snum = get.YB_suit(Array.from(ui.discardPile.childNodes)).length;
				if (snum > dnum) {
					return;
				}
				_status.yb092_chenyu = true;
				const hs = {},
					discard = [];
				player.getCards('h', (cardx) => (hs[cardx.suit] ??= []).push(cardx));
				for (const i of Object.values(hs)) {
					i.sort((a, b) => get.value(a) - get.value(b));
				}
				while (discard.length < dnum) {
					let suit;
					let value = Infinity;
					for (const i in hs) {
						if (!hs[i][0]) {
							continue;
						}
						let val = get.value(hs[i][0]);
						if (get.YB_suit(discard).length < snum == discard.every((j) => j.suit != i)) {
							val -= 2;
						}
						if (val < value) {
							[suit, value] = [i, val];
						}
					}
					discard.push(hs[suit].shift());
				}
				if (get.YB_suit(discard).length != snum) {
					discard.length = 0;
				}
				evt.yb092_chenyu = discard;
				delete _status.yb092_chenyu;
				if (discard.includes(card)) {
					return num - 2;
				}
			},
			get aiUseful() {
				return lib.skill.yb092_chenyu.mod.aiValue;
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'loseAfter',
		},
		filter(event, player) {
			if (event.type != 'discard') {
				return false;
			}
			let cards = event.cards;
			const cards2 = Array.from(ui.discardPile.childNodes).remove(cards);
			return get.YB_suit(cards).length && get.YB_suit(cards2).length && get.YB_suit(cards).length == get.YB_suit(cards2).length;
		},
		content() {
			player.recover();
		},
	},
	yb092_luoyan: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'phaseUseEnd',
		},
		filter(event, player) {
			const history = event.player.getHistory('useCard', function (evt) {
				return evt.getParent('phaseUse') == event;
			});
			return history;
		},
		content() {
			'step 0';
			const history = trigger.player.getHistory('useCard', function (evt) {
				return evt.getParent('phaseUse') == trigger;
			});
			if (history.length > game.countPlayer()) {
				event.nature = 'YB_snow';
			} else {
				event.nature = null;
			}
			event.num = history.length;
			event.count = 1;
			event.target = player;
			('step 1');
			if (event.target.isIn()) {
				player.line(event.target);
				event.target.damage(event.nature, player);
			}
			('step 2');
			if (event.count > event.num) {
				event.finish();
			} else {
				event.count++;
			}
			event.target = event.target.next;
			('step 3');
			if (event.target != player) {
				event.goto(1);
			}
		},
	},

	yb100_lieshi: {
		audio: 'ext:夜白神略/audio/character:2',
		chongzhiji: true,
		chongzhiList: [
			[
				'·受到你造成的1点火焰伤害,然后废除一个随机装备栏',
				{
					content(player, target) {
						'step 0';
						target.damage(1, 'fire', player);
						('step 1');
						let list = [];
						for (let i = 1; i < 5; i++) {
							if (target.hasEnabledSlot(i)) {
								list.add(i);
							}
						}
						let num = list.randomGet();
						target.disableEquip(num);
					},
					ai(player, target) {
						const eff1 = get.damageEffect(target, player, player, 'fire');
						const eff2 = get.damageEffect(target, player, target, 'fire');
						return [eff2, -1, eff1, 0];
					},
				},
			],
			[
				'·受到你造成的2点火焰伤害',
				{
					content(player, target) {
						'step 0';
						target.damage(2, 'fire', player);
					},
					ai(player, target) {
						const eff1 = get.damageEffect(target, player, player, 'fire');
						const eff2 = get.damageEffect(target, player, target, 'fire');
						return [eff2 * 2, 0, eff1 * 2, 0];
					},
				},
			],
			[
				'·受到你造成的3点火焰伤害,然后摸三张牌',
				{
					content(player, target) {
						'step 0';
						target.damage(3, 'fire', player);
						('step 1');
						target.draw(3);
					},
					ai(player, target) {
						const eff1 = get.damageEffect(target, player, player, 'fire');
						const eff2 = get.damageEffect(target, player, target, 'fire');
						return [eff2 * 3, 1.5, eff1 * 3, 0];
					},
				},
			],
		],
		init(player, skill) {
			player.storage[skill + '_chongzhijiList'] = lib.skill[skill].chongzhiList;
		},
		mark: true,
		marktext: '誓',
		intro: {
			content(storage, player) {
				storage = get.YB_chongzhiList(player, 'yb100_lieshi');
				if (!storage) {
					return '无';
				}
				let list1 = player.storage['yb100_lieshi_chongzhijiList'];

				let str = '<br>';
				for (let i = 0; i < list1.length; i++) {
					if (storage.includes(list1[i])) {
						str += '<span class=yellowtext>' + list1[i][0] + '</span><br>';
					} else {
						str += '<span style="opacity:0.5;">' + list1[i][0] + '</span><br>';
					}
				}
				for (let i = 0; i < storage.length; i++) {
					if (!list1.includes(storage[i])) {
						str += '<span class=thundertext>' + storage[i][0] + '</span><br>';
					}
				}
				return '当前列表如下:' + str;
			},
		},
		usable: 1,
		enable: 'phaseUse',
		selectTarget: 1,
		filterTarget: lib.filter.notMe,
		filter(event, player) {
			const storage = get.YB_chongzhiList(player, 'yb100_lieshi');
			if (!storage || storage.length == 0) {
				return false;
			}
			return true;
		},
		subSkill: {
			block: { onremove: true },
		},
		prompt(event, player) {
			player = player || _status.event.player;
			const storage = get.YB_chongzhiList(player, 'yb100_lieshi');
			if (!storage) {
				return '无';
			}
			let list1 = player.storage['yb100_lieshi_chongzhijiList'];

			let str = '<br>';
			for (let i = 0; i < list1.length; i++) {
				if (storage.includes(list1[i])) {
					str += '<span class=yellowtext>' + list1[i][0] + '</span><br>';
				} else {
					str += '<span style="opacity:0.5;">' + list1[i][0] + '</span><br>';
				}
			}
			for (let i = 0; i < storage.length; i++) {
				if (!list1.includes(storage[i])) {
					str += '<span class=thundertext>' + storage[i][0] + '</span><br>';
				}
			}
			return '当前列表如下:' + str + lib.skill['yb100_lieshi'].prompt2;
		},
		prompt2: '出牌阶段限一次,你可以选择一名其他角色,你令你们之一先选择列表其中一项执行,然后另一方执行列表中其未选择的一项',
		content() {
			'step 0';
			event.storage = get.YB_chongzhiList(player, 'yb100_lieshi');
			let list1 = player.storage['yb100_lieshi_chongzhijiList'];

			let str = '<br>';
			for (let i = 0; i < list1.length; i++) {
				if (event.storage.includes(list1[i])) {
					str += '<span class=yellowtext>' + list1[i][0] + '</span><br>';
				} else {
					str += '<span style="opacity:0.5;">' + list1[i][0] + '</span><br>';
				}
			}
			for (let i = 0; i < event.storage.length; i++) {
				if (!list1.includes(event.storage[i])) {
					str += '<span class=thundertext>' + event.storage[i][0] + '</span><br>';
				}
			}
			player
				.chooseControl('你先选', '对方先选')
				.set('prompt', '你先选还是对方先选？' + str)
				.set('ai', function (control) {
					if (event.storage.length > 1) {
						return '你先选';
					} else {
						return '对方先选';
					}
				});
			('step 1');
			event.YBlist = result.index == 0 ? [player, target] : [target, player];
			event.count = 0;
			('step 2');
			if (!event.YBlist[event.count] || !event.YBlist[event.count].isIn()) {
				event.finish();
			} else {
				event.tar = event.YBlist[event.count];
				let list2 = get.YB_chongzhiList(player, 'yb100_lieshi');
				event.list3 = [];
				event.list4 = [];
				for (let i = 0; i < list2.length; i++) {
					event.list3.push(list2[i][0]);
					event.list4.push(list2[i][1]);
				}
				if (event.list3.length == 1) {
					event._result = { links: [event.list3[0]] };
				} else if (event.list3.length > 1) {
					event.tar.chooseButton([[event.list3, 'tdnodes']]).set('ai', function (link) {
						let num2;
						for (let i = 0; i < event.list3.length; i++) {
							if (event.list3[i] == link) {
								num2 = i + 1;
							}
						}
						if (num2) {
							const list66 = event.list4[num2 - 1].ai(player, event.tar);
							let att = get.attitude(player, event.tar);
							const num3 = list66[0] * att + list66[1];
							return num3;
						}
					});
				} else {
					event.finish();
				}
			}
			('step 3');
			if (result.links) {
				for (let i = 0; i < event.list3.length; i++) {
					if (event.list3[i] == result.links[0]) {
						event.num1 = i + 1;
					}
				}
				if (event.num1) {
					get.YB_chongzhiList(player, 'yb100_lieshi').remove(get.YB_chongzhiList(player, 'yb100_lieshi')[event.num1 - 1]);
					event.list4[event.num1 - 1].content(player, event.tar);
				}
			}
			('step 4');
			event.count++;
			event.goto(2);
		},
		ai: {
			damage: true,
			fireAttack: true,
			order: 8,
			result: {
				player(player, target) {
					if (player.hp <= 2) {
						return -10;
					}
					if (player.hp >= target.hp) {
						return 0.9;
					}
					return -2;
				},
				target(player, target) {
					return get.damageEffect(target, player, player, 'fire');
				},
			},

			threaten: 1.3,
		},
	},

	yb100_dianzhan: {
		audio: 'ext:夜白神略/audio/character:2',
		chongzhiji: true,
		chongzhiList: [
			[
				'·横置自身然后展示手牌并重铸一种花色所有手牌',
				{
					content(player, target) {
						'step 0';
						target.link(true);
						const next = game.createEvent('YB_chooseToChongzhu', false);
						next.player = target;
						next.setContent('YB_chooseToChongzhu');
						return next;
					},
					ai(player, target) {
						return [1, 1, 1, 0];
					},
				},
			],
			[
				'·调整手牌至四张',
				{
					content(player, target) {
						target.YB_changeHandCard(4);
					},
					ai(player, target) {
						let num = 4 - target.countCards('h');
						return [1, num, 1, 0];
					},
				},
			],
			[
				'·展示手牌并弃置每种类型手牌各一张',
				{
					content(player, target) {
						'step 0';
						let cards = target.getCards('h');
						const suits = get.YB_suit(cards, 'type2');
						target.showCards(cards);
						target
							.chooseToDiscard('h', suits.length, true, function (card) {
								const suit2 = get.YB_suit(ui.selected.cards, 'type2');
								return !suit2.includes(get.type(card));
							})
							.set('complexCard', true);
					},
					ai(player, target) {
						let num = -Math.min(target.countCards('h') / 2, 3);
						return [1, num, 1, 0];
					},
				},
			],
		],
		init(player, skill) {
			player.storage[skill + '_chongzhijiList'] = lib.skill[skill].chongzhiList;
			player.storage[skill + '_mark'] = [];
		},

		mark: true,
		marktext: '盏',
		intro: {
			content(storage, player) {
				storage = get.YB_chongzhiList(player, 'yb100_dianzhan');
				if (!storage) {
					return '无';
				}

				let list1 = player.storage['yb100_dianzhan_chongzhijiList'];
				let str = '<br>';
				for (let i = 0; i < list1.length; i++) {
					if (storage.includes(list1[i])) {
						str += '<span class=yellowtext>' + list1[i][0] + '</span><br>';
					} else {
						str += '<span style="opacity:0.5;">' + list1[i][0] + '</span><br>';
					}
				}
				for (let i = 0; i < storage.length; i++) {
					if (!list1.includes(storage[i])) {
						str += '<span class=thundertext>' + storage[i][0] + '</span><br>';
					}
				}
				return '当前列表如下:' + str;
			},
		},
		prompt(event, player) {
			player = player || _status.event.player;
			const storage = get.YB_chongzhiList(player, 'yb100_dianzhan');
			if (!storage) {
				return '无';
			}

			let list1 = player.storage['yb100_dianzhan_chongzhijiList'];
			let str = '<br>';
			for (let i = 0; i < list1.length; i++) {
				if (storage.includes(list1[i])) {
					str += '<span class=yellowtext>' + list1[i][0] + '</span><br>';
				} else {
					str += '<span style="opacity:0.5;">' + list1[i][0] + '</span><br>';
				}
			}
			for (let i = 0; i < storage.length; i++) {
				if (!list1.includes(storage[i])) {
					str += '<span class=thundertext>' + storage[i][0] + '</span><br>';
				}
			}
			return '当前列表如下:' + str + lib.skill['yb100_dianzhan'].prompt2;
		},
		prompt2: '当你使用牌指定目标时,若此是你本回合首次指定其为目标,你横置自身并执行列表中的一项,然后令目标也执行此项',
		subSkill: {
			mark: {
				onremove(player, skill) {
					player.storage[skill] = [];
				},
			},
		},
		trigger: { player: 'useCardToTarget' },
		filter(event, player) {
			const storage = get.YB_chongzhiList(player, 'yb100_dianzhan');
			if (!storage || storage.length == 0) {
				return false;
			}
			if (!player.storage.yb100_dianzhan_mark) {
				return true;
			} else if (player.storage.yb100_dianzhan_mark.includes(event.target)) {
				return false;
			}
			return true;
		},
		forced: true,
		logTarget: 'target',
		content() {
			'step 0';
			player.addTempSkill('yb100_dianzhan_mark');
			if (!player.storage.yb100_dianzhan_mark) {
				player.storage.yb100_dianzhan_mark = [];
			}
			player.storage.yb100_dianzhan_mark.push(trigger.target);
			event.tar = trigger.target;
			('step 1');
			player.link(true);
			let list2 = get.YB_chongzhiList(player, 'yb100_dianzhan');
			event.list3 = [];
			event.list4 = [];
			for (let i = 0; i < list2.length; i++) {
				event.list3.push(list2[i][0]);
				event.list4.push(list2[i][1]);
			}
			if (event.list3.length == 1) {
				event._result = { links: [event.list3[0]] };
			} else if (event.list3.length > 1) {
				player.chooseButton([lib.skill['yb100_dianzhan'].prompt2, [event.list3, 'tdnodes']], true).set('ai', function (link) {
					let num2;
					for (let i = 0; i < event.list3.length; i++) {
						if (event.list3[i] == link) {
							num2 = i + 1;
						}
					}
					if (num2) {
						const list66 = event.list4[num2 - 1].ai(player, player);
						const list77 = event.list4[num2 - 1].ai(player, event.tar);
						const att1 = get.attitude(player, player);
						const att2 = get.attitude(player, event.tar);
						const num3 = list77[0] * att2 + list77[1];
						const num4 = list66[0] * att1 + list66[1];
						return num4 - num3;
					}
				});
			} else {
				event.finish();
			}
			('step 2');
			if (result.links) {
				for (let i = 0; i < event.list3.length; i++) {
					if (event.list3[i] == result.links[0]) {
						event.num1 = i + 1;
					}
				}
				if (event.num1) {
					get.YB_chongzhiList(player, 'yb100_dianzhan').remove(get.YB_chongzhiList(player, 'yb100_dianzhan')[event.num1 - 1]);
					event.sss = event.list4[event.num1 - 1].content;
				}
			}
			('step 3');
			event.sss(player, player);
			('step 4');
			if (player != trigger.target) {
				event.sss(player, trigger.target);
			}
		},
	},

	yb100_huanyin: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'dying' },
		forced: true,
		changeCards(player, link) {
			let list1 = get.YB_chongzhiList(player, 'yb100_lieshi');

			let list2 = player.storage['yb100_lieshi_chongzhijiList'];
			const list3 = get.YB_chongzhiList(player, 'yb100_dianzhan');

			const list4 = player.storage['yb100_dianzhan_chongzhijiList'];
			const lista = [],
				listb = [],
				listc = [],
				listd = [],
				liste = [],
				listf = [];
			const listj = [],
				listk = [];
			for (const i of list2) {
				listb.add(i);
				if (list1.includes(i)) {
					listj.add(i);
				}
			}
			for (let k of list4) {
				listd.add(k);
				if (list3.includes(k)) {
					listk.add(k);
				}
			}
			let num = 1;
			num += list2.length;
			num += list4.length;
			num -= listj.length;
			num -= listk.length;
			if (!link) {
				return num;
			} else {
				if (listb.includes(link)) {
					listb.remove(link);
					listd.add(link);
				} else {
					listd.remove(link);
					listb.add(link);
				}

				for (const i of listb) {
					if (list1.includes(i)) {
						liste.add(i);
					}
				}
				for (let k of listd) {
					if (list3.includes(k)) {
						listf.add(k);
					}
				}
				let num2 = 1;
				num2 += listb.length;
				num2 += listd.length;
				num2 -= liste.length;
				num2 -= listf.length;
				return num2;
			}
		},
		content() {
			'step 0';
			let list1 = get.YB_chongzhiList(player, 'yb100_lieshi');
			let list2 = player.storage['yb100_lieshi_chongzhijiList'];
			const list3 = get.YB_chongzhiList(player, 'yb100_dianzhan');
			const list4 = player.storage['yb100_dianzhan_chongzhijiList'];
			const listj = [],
				listk = [],
				listq = [];
			for (const i of list2) {
				listq.add(i);
				if (list1.includes(i)) {
					listj.add(i[0]);
				}
			}
			for (let k of list4) {
				listq.add(k);
				if (list3.includes(k)) {
					listk.add(k[0]);
				}
			}
			const dialog = ui.create.dialog('<font size=6><b>还阴</b></font>', 'forcebutton', 'hidden');
			dialog.add('请选择移至另一刷新列表的选项');
			if (listj.length) {
				dialog.add('烈誓列表');
				dialog.add([listj, 'textbutton']);
			}
			if (listk.length) {
				dialog.add('点盏列表');
				dialog.add([listk, 'textbutton']);
			}
			if (listj.length + listk.length) {
				player.chooseButton(dialog, 1, true);
			}
			event.list2 = list2;
			event.list4 = list4;
			('step 1');
			for (let m = 0; m < event.list2.length; m++) {
				if (event.list2[m][0] == result.links[0]) {
					game.log('从【烈誓】调整了' + result.links[0] + '·至【点盏】');
					event.hhhhh = m;
				}
			}
			for (let n = 0; n < event.list4.length; n++) {
				if (event.list4[n][0] == result.links[0]) {
					game.log('从【点盏】调整了' + result.links[0] + '·至【烈誓】');
					event.zzzzz = n;
				}
			}
			('step 2');
			if (event.hhhhh) {
				player.storage['yb100_dianzhan_chongzhijiList'].add(event.list2[event.hhhhh]);
				player.storage['yb100_lieshi_chongzhijiList'].remove(event.list2[event.hhhhh]);
			} else if (event.zzzzz) {
				player.storage['yb100_lieshi_chongzhijiList'].add(event.list4[event.zzzzz]);
				player.storage['yb100_dianzhan_chongzhijiList'].remove(event.list4[event.zzzzz]);
			}
			('step 3');
			const num666 = lib.skill.yb100_huanyin.changeCards(player);
			game.log('当前已使用选项数为', num666 - 1);
			player.YB_changeHandCard(num666 - 1);
			('step 4');
			player.showCards(player.getCards('h'));
			if (player.countCards('h') == 0 || get.YB_suit(player.getCards('h')).length == player.getCards('h').length) {
				if (player.hp < 1) {
					player.recover(1 - player.hp);
				}
			}
		},
	},

	ybsl_rumeng: {
		mainSkill: true,
		available(mode) {
			if (['guozhan', 'taixuhuanjing'].includes(mode)) {
				return true;
			}
			return false;
		},
		trigger: { player: ['showCharacterAfter'] },

		forced: true,
		content() {
			if (player.checkMainSkill('ybsl_rumeng')) {
				player.changeGroup('YB_dream', false);
			}
		},
	},
	yb014_fufeng: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb014_yongyue: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	yb014_sanmeng: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	yb014_gugu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseUseAfter',
		},
		filter(event, player) {
			let num = 0;
			let evt = _status.event.getParent('phaseUse');
			player.getHistory('useCard', function (evtx) {
				if (evtx.getParent('phaseUse') == evt) {
					num++;
				}
			});
			return num <= player.hp;
		},
		content: async function (event, trigger, player) {
			let list = [];
			let evt = _status.event.getParent('phaseUse');
			player.getHistory('useCard', function (evtx) {
				if (evtx.getParent('phaseUse') == evt) {
					list.push(evtx);
				}
			});
			for (const i of list) {
				if (player.hasUseTarget(i)) {
					await player.chooseUseTarget(
						{
							name: i.name,
							nature: i.nature,
							isCard: false,
						},
						cards,
						'是否使用【' + i.nature ? get.translation(i.nature) : '' + get.translation(i.name) + '】',
						false,
					);
				}
			}
		},
	},
	yb014_minsheng: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			source: 'damageBegin2',
		},
		filter(event, player) {
			return event.player && event.player.hp && player && player.hp && event.player.hp == player.hp;
		},
		content: async function (event, trigger, player) {
			let num = Math.min(trigger.num, 5);
			trigger.cancel();
			await player.draw(num);
		},
	},
	yb014_reminsheng: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			source: 'damageBegin2',
		},
		filter(event, player) {
			return event.player && event.player.hp && player && player.hp && event.player.hp == player.hp;
		},
		content: async function (event, trigger, player) {
			let num = Math.min(trigger.num, 5);
			trigger.cancel();
			await player.loseHp();
			await player.draw(num * 2);
		},
	},

	yb107_xunhu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseBefore',
			player: 'enterGame',
		},
		forced: true,
		filter(event, player) {
			return (event.name != 'phase' || game.phaseNumber == 0) && !player.storage.yb107_xunhu;
		},

		content() {
			let card = game.YB_createCard('ybsl_107xiaohu0', null, null);
			player.storage.yb107_xunhu = card;
			ui.cardPile.insertBefore(card, ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length)]);
			game.broadcastAll(function () {
				lib.inpile.add('ybsl_107xiaohu0');
			});
			game.updateRoundNumber();
		},
	},

	yb107_taye: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCardAfter',
		},

		mark: true,
		intro: {
			content: '$',
		},

		filter(event, player) {
			let cards = Array.from(ui.discardPile.childNodes);
			if (cards.length == 0) {
				return false;
			}
			return get.YB_type2(cards).includes(get.type2(event.card));
		},
		content: async function (event, trigger, player) {
			let cards = Array.from(ui.discardPile.childNodes);

			{
				const typeyb = get.type2(trigger.card);
				let list = cards.filter((card) => get.type2(card) == typeyb);
				if (!player.storage.yb107_taye) {
					player.storage.yb107_taye = 1;
				}
				let num = player.storage.yb107_taye;

				player.storage.yb107_taye = 1;
				const result = await player
					.chooseCardButton('请选择弃牌堆中至多[' + num + ']张' + get.translation(get.type2(trigger.card)) + '牌,置于牌堆底,先选的靠上,最后选的垫底', [1, num])
					.set('ai', function () {
						return true;
					})
					.forResult();
				if (result.bool) {
					const cards1 = result.links;
					let numb = cards.length;
					for (let i = 0; i < cards1.length; i++) {
						ui.cardPile.appendChild(cards1[i]);
					}
					const cards2 = get.cards(numb);
					await game.cardsGotoOrdering(cards2);
					const cards3 = [],
						cards4 = [];
					for (let k of cards2) {
						if (get.type2(k) == typeyb) {
							cards3.push(k);
						} else {
							cards4.push(k);
						}
					}
					if (cards4.length) {
						game.cardsDiscard(cards4);
					}
					if (cards3.length) {
						const next = game.createEvent('yb107_taye');
						next.player = player;
						next.cards3 = cards3;
						next.setContent(function () {
							'step 0';
							event.ybmap = {};
							('step 1');
							player.chooseCardButton(event.cards3, [1, Infinity], '踏野:请选择任意张牌,然后选择一名角色,若仍有未分配的牌,则继续选择').set('ai', function (button) {
								return get.value(button.link);
							});
							('step 2');
							if (result.cards) {
								event.cards6 = result.cards;
								player.chooseTarget(true, '踏野:请选择任意张牌,然后选择一名角色,若仍有未分配的牌,则继续选择').set('ai', function (target) {
									return get.attitude(_status.event.player, target);
								});
							} else {
								event.goto(5);
							}
							('step 3');
							if (result.targets) {
								const tar = result.targets;
								if (!event.ybmap[tar]) {
									event.ybmap[tar] = [];
								}
								event.ybmap[tar].push(event.cards6);
								event.cards3.remove(event.cards6);
								event.tayeok = true;
							}
							('step 4');
							if (event.cards3.length) {
								event.goto(1);
							}
							('step 5');
							if (event.tayeok) {
								let list = [];
								for (const z in event.ybmap) {
									list.push([z, event.ybmap[z]]);
								}

								game.loseAsync({
									gain_list: list,
									player: player,
									cards: list.slice().map((list) => list[1]),
									giver: player,
									animate: 'giveAuto',
								}).setContent('gaincardMultiple');
							} else {
								event.finish();
							}
						});
						const cartar = await next.forResult();
					}
				}
			}
		},
		group: 'yb107_taye_buff',
		subSkill: {
			buff: {
				forced: true,
				audio: 'yb107_taye',
				trigger: {
					global: ['loseAfter', 'cardsDiscardAfter', 'loseAsyncAfter'],
				},
				filter(event, player) {
					if (event.name.indexOf('lose') == 0) {
						if (event.getlx === false || event.position != ui.discardPile) {
							return false;
						}
					} else {
						let evt = event.parent;
						if (evt.relatedEvent && evt.relatedEvent.name == 'useCard') {
							return false;
						}
					}
					return true;
				},
				content() {
					if (!player.storage.yb107_taye) {
						player.storage.yb107_taye = 1;
					}
					if (player.storage.yb107_taye < 5) {
						player.storage.yb107_taye++;
					}
				},
			},
		},
	},

	yb107_yaoyi: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		hiddenCard(player, name) {
			const type = get.type(name);
			return type == 'basic';
		},
		filter(event, player) {
			if (
				!player.countCards('e') &&
				!player.countCards('j') &&
				!player.getCards('h', {
					name: 'ybsl_107xiaohu',
				}).length
			) {
				return false;
			}
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			for (const i of lib.inpile) {
				const type = get.type(i);
				if (
					type == 'basic' &&
					evt(
						{
							name: i,
						},
						player,
						event,
					)
				) {
					return true;
				}
			}
			return false;
		},

		chooseButton: {
			dialog(event, player) {
				const type = 'basic';
				let list = [];
				for (let name of lib.inpile) {
					if (get.type(name) == type) {
						list.push([type, '', name]);
						if (name == 'sha') {
							for (let j of get.YB_natureList()) {
								j = get.YB_nature(j);
								list.push([type, '', name, j]);
							}
						}
					}
				}
				const dialog = ui.create.dialog('妖异', [list, 'vcard'], 'hidden');

				return dialog;
			},
			filter(button, player) {
				return _status.event.parent.filterCard(
					{
						name: button.link[2],
					},
					player,
					_status.event.parent,
				);
			},
			backup(links, player) {
				return {
					audio: 'yb107_yaoyi',
					selectCard: -1,
					card: links[0],
					delay: false,

					content() {
						'step 0';
						let card = lib.skill.yb107_yaoyi_backup.card;
						event.card = card;
						('step 1');
						const equips = [];
						const hss = player.getCards('h', {
							name: 'ybsl_107xiaohu0',
						});
						if (hss.length) {
							equips.push(hss);
						}
						if (player.countCards('e')) {
							equips.push(player.getCards('e'));
						}
						if (player.countCards('j')) {
							equips.push(player.getCards('j'));
						}

						player.chooseButton(['妖异:选择要转化的牌', equips]);
						('step 2');
						let evt = event.getParent(2);
						if (result.bool && result.links && result.links.length) {
							let name = event.card.name;
							game.broadcastAll(
								function (result, name) {
									lib.skill.yb107_yaoyi_bbb.viewAs = {
										name: name,
										cards: [result],
									};
									lib.skill.yb107_yaoyi_bbb.prompt = '选择' + get.translation(result) + '的目标';
								},
								result.links[0],
								name,
							);
							evt.set('_backupevent', 'yb107_yaoyi_bbb');
							evt.backup('yb107_yaoyi_bbb');
						}
					},
				};
			},
		},

		group: 'yb107_yaoyi_buff',
		subSkill: {
			bbb: {
				sourceSkill: 'yb107_yaoyi',
				precontent() {
					delete event.result.skill;
					let name = event.result.card.name;
					event.result.cards = event.result.card.cards;
					event.result.card = event.result.cards[0];
					event.result.card.name = name;
				},
				filterCard() {
					return false;
				},
				selectCard: -1,
			},
			buff: {
				trigger: {
					player: 'useCardAfter',
				},
				filter(event, player) {
					let evt = event;

					return evt.skill == 'yb107_yaoyi_backup' && lib.skill.yb107_yaoyi_backup.card.name.slice(-1) == 'ybsl_107xiaohu';
				},
				content() {
					const card6 = trigger.cards[0];
					ui.cardPile.insertBefore(card6, ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length)]);
				},
			},
		},
	},

	QQQ107_taye: {
		audio: 'yb107_taye',
		trigger: {
			player: 'useCardAfter',
		},
		forced: true,
		mark: true,
		intro: {
			content: '$',
		},
		init: (player) => (player.storage.QQQ107_taye = 1),

		filter: (event, player) => Array.from(ui.discardPile.childNodes).some((q) => get.type(q) == get.type(event.card)),
		async content(event, trigger, player) {
			let num = player.storage.QQQ107_taye;
			const { result } = await player.chooseButton(['从弃牌堆中选择至多' + num + '张与此牌类型相同的其他牌', Array.from(ui.discardPile.childNodes).filter((q) => get.type(q) == get.type(trigger.card))], [1, num]).set('ai', (button) => get.buttonValue(button));
			if (result.links && result.links[0]) {
				player.storage.QQQ107_taye = 1;
				for (const i of result.links) {
					ui.cardPile.appendChild(i);
					game.log('将' + get.translation(i) + '由弃牌堆置入牌堆');
				}
				let card = get.cards(result.links.length);
				let card1 = [];
				game.cardsGotoOrdering(card);
				player.showCards(card);
				for (const i of card) {
					if (get.type(i) != get.type(trigger.card)) {
						ui.cardPile.appendChild(i);
						game.log('将' + get.translation(i) + '由处理区置入弃牌堆');
						player.storage.QQQ107_taye++;
					} else {
						card1.push(i);
					}
				}
				while (card1.length) {
					const { result: result1 } = await player.chooseButton(['依次分配给场上角色', card1], [1, card1.length]);
					if (result1.links && result1.links[0]) {
						const { result: result2 } = await player.chooseTarget('依次分配给场上角色').set('ai', (t) => get.attitude(t, player));
						if (result2.targets && result2.targets[0]) {
							result2.targets[0].gain(result1.links, 'gain2');
							card1 = card1.filter((q) => !result1.links.includes(q));
						}
					}
				}
			}
		},
		group: 'QQQ107_taye_buff',
		subSkill: {
			buff: {
				forced: true,
				audio: 'QQQ107_taye',
				trigger: {
					global: ['loseAfter', 'cardsDiscardAfter', 'loseAsyncAfter'],
				},
				filter(event, player) {
					if (event.name.indexOf('lose') == 0) {
						if (event.getlx === false || event.position != ui.discardPile) {
							return false;
						}
					} else {
						let evt = event.parent;
						if (evt.relatedEvent && evt.relatedEvent.name == 'useCard') {
							return false;
						}
					}
					return true;
				},
				content() {
					if (player.storage.QQQ107_taye < 5) {
						player.storage.QQQ107_taye++;
					}
				},
			},
		},
	},

	QQQ107_yaoyi: {
		audio: 'yb107_yaoyi',
		enable: ['chooseToUse', 'chooseToRespond'],
		filter(event, player) {
			for (let i in lib.card) {
				if (
					lib.card[i].type == 'basic' &&
					event.filterCard(
						{
							name: i,
						},
						player,
						event,
					) &&
					(player.countCards('ejsx') ||
						player.hasCard('h', {
							name: 'ybsl_107xiaohu',
						}))
				) {
					return true;
				}
			}
			return false;
		},
		hiddenCard: (player, name) => lib.card[name].type == 'basic',

		async content(event, trigger, player) {
			let cards = player.getCards('esjx');
			let card = player.getCards('h', 'ybsl_107xiaohu')[0];
			if (card) {
				cards.push(card);
			}
			if (cards[0]) {
				const { result } = await player.chooseButton(['将【小狐】或非手牌区一张牌当做一张基本牌使用或打出', cards]);
				if (result.links && result.links[0]) {
					let list = [];
					for (let i in lib.card) {
						if (lib.card[i].mode && !lib.card[i].mode.includes(lib.config.mode)) {
							continue;
						}
						if (
							lib.card[i].type == 'basic' &&
							event.getParent(2).filterCard(
								{
									name: i,
								},
								player,
								event,
							)
						) {
							list.push(['basic', '', i]);
							if (i == 'sha') {
								for (let j of Array.from(lib.nature.keys())) {
									list.push(['基本', '', 'sha', j]);
								}
							}
						}
					}
					const { result: result1 } = await player.chooseButton(['使用或打出一张基本牌', [list, 'vcard']]);
					if (result1.links && result1.links[0]) {
						let evt = event.getParent(2);
						if (evt.name == 'chooseToUse' && result1.links[0][2] != 'shan') {
							await player.chooseUseTarget(
								{
									name: result1.links[0][2],
									nature: result1.links[0][3],
								},
								result.links,
								true,
								false,
							);
						} else {
							evt.untrigger();
							evt.set('responded', true);
							evt.result = {
								bool: true,
								card: {
									name: result1.links[0][2],
								},
								cards: result.links,
							};
							evt.redo();
						}
						if (result.links[0].name == 'ybsl_107xiaohu') {
							ui.cardPile.insertBefore(result.links[0], ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)]);
						}
					}
				}
			}
		},
		ai: {
			order: 80,
			respondShan: true,
			respondSha: true,
			save: true,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
	},
	ybsl_107xiaohu: {
		equipSkill: true,
		charlotte: true,
		group: ['ybsl_107xiaohu_2', 'ybsl_107xiaohu_3', 'ybsl_107xiaohu_4'],
		subSkill: {
			2: {
				equipSkill: true,
				forced: true,
				trigger: {
					player: 'damageAfter',
				},
				content() {
					if (player.countCards('h')) {
						player.showCards(player.getCards('h'));
					}
					player.draw(5);
				},
				ai: {
					maixie: true,
					maixie_hp: true,
					effect: {
						target(card, player, target) {
							if (player.hasSkillTag('jueqing', false, target)) {
								return [1, -1];
							}
							return 5;
						},
					},
				},
			},
			3: {
				equipSkill: true,
				forced: true,
				trigger: {
					player: 'drawBefore',
				},
				content() {
					if (player.countCards('h')) {
						let num = get.YB_type2(player.getCards('h')).length;
						trigger.num -= num;
						if (trigger.num <= 0) {
							trigger.finish();
						}
					}
				},
			},
			4: {
				equipSkill: true,
			},
		},
	},

	yb121_yuanjie: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		trigger: {
			global: 'damageSource',
		},
		filter(event, player) {
			return event.source && event.source.isIn() && event.player && event.player.isIn();
		},
		content() {
			'step 0';
			trigger.player.recover();
			if (!trigger.player.countMark('yb121_yuanjie_mark')) {
				trigger.player.addMark('yb121_yuanjie_mark');
			}
			('step 1');
			trigger.source.draw(2);
			('step 2');
			let num = game.countPlayer((c) => c.countMark('yb121_yuanjie_mark') > 0);
			player.draw(num);
		},
		check(event, player) {
			return true;
		},
		subSkill: {
			mark: {
				mark: true,
				marktext: '缘',
			},
		},
	},
	yb121_tiandu: {
		audio: 'ext:夜白神略/audio/character:2',
		inherit: 'ybmjz_tiandu',
	},

	yb122_yinjin: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',
		selectCard: 1,
		filterCard(card) {
			return true;
		},
		selectTarget: 1,
		filterTarget(card, player, target) {
			return true;
		},
		check(card) {
			return -get.value(card);
		},
		discard: false,
		position: 'h',
		content() {
			'step 0';
			player.give(event.cards, event.target);
			player.$give(event.cards, event.target, true);
			('step 1');
			event.target.chooseDrawRecover(2, true);
			('step 2');

			if (!player.storage.yb122_yinjin) {
				player.storage.yb122_yinjin = [];
			}
			player.storage.yb122_yinjin.push(event.target);

			player
				.when({ global: 'damageEnd' })
				.filter(function (event, player) {
					if (!event.source) {
						return false;
					}
					const playerx = event.source;
					return playerx.isIn() && player.storage.yb122_yinjin && player.storage.yb122_yinjin.includes(playerx) && playerx.countCards('h') > 0;
				})
				.then(function () {
					const playerx = trigger.source;
					if (player.storage.yb122_yinjin?.includes(playerx)) {
						player.storage.yb122_yinjin.remove(playerx);
					}
					playerx.chooseCard('选择是否一张手牌交给' + get.translation(player)).set('ai', function (card) {
						if (get.attitude(playerx, player) > 0) {
							return get.value(card, player);
						}
						return false;
					});
				})
				.then(function () {
					if (result.bool) {
						const playerx = trigger.source;
						playerx.give(result.cards, player);
					}
				})
				.then(function () {
					if (result.bool) {
						player.chooseDrawRecover(2, true);
					}
				});
		},
		ai: {
			order: 3,
			result: {
				target: 1,
			},
		},
	},
	yb122_yinjinsp: {
		audio: 'yb122_yinjin',
		usable: 1,
		enable: 'phaseUse',
		selectCard: 1,
		filterCard(card) {
			return true;
		},
		selectTarget: 1,
		filterTarget(card, player, target) {
			return true;
		},
		check(card) {
			return -get.value(card);
		},
		discard: false,
		position: 'h',
		content() {
			'step 0';
			player.give(event.cards, event.target);
			player.$give(event.cards, event.target, true);
			('step 1');
			event.target.chooseDrawRecover(2, true);
			('step 2');

			if (!player.storage.yb122_yinjinsp) {
				player.storage.yb122_yinjinsp = [];
			}
			player.storage.yb122_yinjinsp.push(event.target);

			player
				.when({ global: 'damageEnd' })
				.filter(function (event, player) {
					if (!event.source) {
						return false;
					}
					const playerx = event.source;
					return playerx.isIn() && player.storage.yb122_yinjinsp && player.storage.yb122_yinjinsp.includes(playerx);
				})
				.then(function () {
					const playerx = trigger.source;
					if (player.storage.yb122_yinjinsp?.includes(playerx)) {
						player.storage.yb122_yinjinsp.remove(playerx);
					}
					player.chooseDrawRecover(2);
				});
		},
		ai: {
			order: 3,
			result: {
				target: 1,
			},
		},
	},
	yb122_buchen: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		mod: {
			targetEnabled(card, player, target, now) {
				if (!get.tag(card, 'damage')) {
					return false;
				}
			},
			cardDiscardable(card, player) {
				return false;
			},
			canBeDiscarded(card, player) {
				return false;
			},
			aiOrder(player, card, num) {
				if (num > 0 && card.name == 'huogong') {
					return 0;
				}
			},
			aiValue(player, card, num) {
				if (num > 0 && card.name == 'huogong') {
					return 0.01;
				}
				if (num > 0) {
					if (lib.card[card.name].toself) {
						return 0.1;
					}
				}
			},
			aiUseful(player, card, num) {
				if (num > 0 && card.name == 'huogong') {
					return 0;
				}
			},
		},
	},
	yb122_sanmeng: {
		audio: 'ybsl_sanmeng',
	},

	yb123_zouhe: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',
		filter(event, player) {
			if (!player.countCards('h')) {
				return false;
			}
			return game.hasPlayer((target) => lib.skill.yb123_zouhe.filterTarget(null, player, target));
		},
		filterTarget(event, player, target) {
			return player.canCompare(target);
		},
		content() {
			'step 0';
			player.chooseToCompare(target);
			('step 1');
			((event.winer = []), (event.loser = []));
			event.wincard = [];
			if (!result.tie) {
				if (result.bool) {
					event.loser.push(target);
					event.winer.push(player);
					event.wincard.push(result.player);
				} else {
					event.loser.push(player);
					event.winer.push(target);
					event.wincard.push(result.target);
				}
			} else {
				event.loser.push(target);
				event.loser.push(player);
			}
			event.cardsx = [result.player, result.target].filterInD('d');
			('step 2');
			if (event.winer.length && event.wincard.length) {
				if (event.winer[0].hasUseTarget(event.wincard[0])) {
					event.resultx = event.winer[0].chooseUseTarget([event.wincard[0]]);
				}
			}
			('step 3');
			if (!event.winer.includes(player) || !event.resultx.bool) {
				if (event.cardsx[0] && get.position(event.cardsx[0], true) == 'd') {
					player.gain(event.cardsx[0], 'gain2');
				}
				player.recover();
			}
			('step 4');
			if (!event.winer.includes(target) || !event.resultx.bool) {
				if (event.cardsx[1] && get.position(event.cardsx[1], true) == 'd') {
					target.gain(event.cardsx[1], 'gain2');
				}
				target.recover();
			}
		},
	},
	yb123_bixin: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	ybsl_aocai: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: ['chooseToUse', 'chooseToRespond'],
		hiddenCard(player, name) {
			if (name != 'wuxie' && lib.inpile.includes(name)) {
				return true;
			}
			return false;
		},
		filter(event, player) {
			if (event.responded || event.ybsl_aocai) {
				return false;
			}
			for (const i of lib.inpile) {
				if (i != 'wuxie' && event.filterCard({ name: i }, player, event)) {
					return true;
				}
			}
			return false;
		},
		delay: false,
		content() {
			'step 0';
			let evt = event.getParent(2);
			evt.set('ybsl_aocai', true);
			let cards = get.cards(player.countCards('h') == 0 ? 4 : 2);
			for (let i = cards.length - 1; i >= 0; i--) {
				ui.cardPile.insertBefore(cards[i].fix(), ui.cardPile.firstChild);
			}
			const aozhan = player.hasSkill('aozhan');
			player
				.chooseButton(['傲才:选择要' + (evt.name == 'chooseToUse' ? '使用' : '打出') + '的牌', cards])
				.set('filterButton', function (button) {
					return _status.event.cards.includes(button.link);
				})
				.set(
					'cards',
					cards.filter(function (card) {
						if (aozhan && card.name == 'tao') {
							return (
								evt.filterCard(
									{
										name: 'sha',
										cards: [card],
									},
									evt.player,
									evt,
								) ||
								evt.filterCard(
									{
										name: 'shan',
										cards: [card],
									},
									evt.player,
									evt,
								)
							);
						}
						return evt.filterCard(card, evt.player, evt);
					}),
				)
				.set('ai', function (button) {
					let evt = _status.event.getParent(3);
					if (evt && evt.ai) {
						const tmp = _status.event;
						_status.event = evt;
						const result = (evt.ai || event.ai1)(button.link, _status.event.player, evt);
						_status.event = tmp;
						return result;
					}
					return 1;
				});
			('step 1');
			let evt1 = event.getParent(2);
			if (result.bool && result.links && result.links.length) {
				let name = result.links[0].name,
					aozhan = player.hasSkill('aozhan') && name == 'tao';
				if (aozhan) {
					name = evt1.filterCard(
						{
							name: 'sha',
							cards: [card],
						},
						evt1.player,
						evt1,
					)
						? 'sha'
						: 'shan';
				}
				if (evt1.name == 'chooseToUse') {
					game.broadcastAll(
						function (result, name) {
							lib.skill.ybsl_aocai_backup.viewAs = { name: name, cards: [result] };
							lib.skill.ybsl_aocai_backup.prompt = '选择' + get.translation(result) + '的目标';
						},
						result.links[0],
						name,
					);
					evt1.set('_backupevent', 'ybsl_aocai_backup');
					evt1.backup('ybsl_aocai_backup');
				} else {
					delete evt1.result.skill;
					delete evt1.result.used;
					evt1.result.card = result.links[0];
					if (aozhan) {
						evt1.result.card.name = name;
					}
					evt1.result.cards = [result.links[0]];
					evt1.redo();
					return;
				}
			}
			evt1.goto(0);
		},
		ai: {
			effect: {
				target(card, player, target, effect) {
					if (get.tag(card, 'respondShan')) {
						return 0.7;
					}
					if (get.tag(card, 'respondSha')) {
						return 0.7;
					}
				},
			},
			order: 11,
			respondShan: true,
			respondSha: true,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
	},
	ybsl_aocai_backup: {
		sourceSkill: 'ybsl_aocai',
		precontent() {
			delete event.result.skill;
			let name = event.result.card.name;
			event.result.cards = event.result.card.cards;
			event.result.card = event.result.cards[0];
			event.result.card.name = name;
		},
		filterCard() {
			return false;
		},
		selectCard: -1,
	},

	ybsl_yiji: {
		enable: 'phaseUse',
		usable: 1,
		filter() {
			return true;
		},
		content() {
			'step 0';
			let cards = get.cards(2);
			game.cardsGotoOrdering(cards);
			player.showCards(cards);
			const num10 = cards[0].number || 4;
			const num11 = cards[1].number || 4;
			if (num10 < num11) {
				event.num1 = num11;
				event.num2 = num10;
			} else {
				event.num1 = num10;
				event.num2 = num11;
			}
			('step 1');
			event.cardsxx = get.cards(event.num1);
			event.cards2 = game.cardsGotoOrdering(event.cardsxx);
			const yb = {};

			const relu = player.YB_yiji(event.num2, event.cards2);
			relu;
			('step 2');
			const cards3 = event.cardsxx.filterInD();
			if (cards3.length) {
				player.addToExpansion(cards3).gaintag.add('ybsl_yiji');
			}
		},
		intro: {
			markcount(storage, player) {
				const content = player.getExpansions('ybsl_yiji');
				return content.length;
			},
			mark(dialog, content, player) {
				content = player.getExpansions('ybsl_yiji');
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						dialog.addAuto(content);
					} else {
						return '共有' + get.cnNumber(content.length) + '张遗计';
					}
				}
			},
			content(content, player) {
				content = player.getExpansions('ybsl_yiji');
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						return get.translation(content);
					}
					return '共有' + get.cnNumber(content.length) + '张遗计';
				}
			},
		},
		group: 'ybsl_yiji_gain',
		subSkill: {
			gain: {
				trigger: { player: 'damageAfter' },
				filter(event, player) {
					const content = player.getExpansions('ybsl_yiji');
					return content.length && event.num;
				},
				async cost(event, trigger, player) {
					let cards = player.getExpansions('ybsl_yiji');
					if (!cards) {
						event.result = {
							bool: false,
						};
					} else {
						let num = Math.min(trigger.num * 2, cards.length);
						const result = await player
							.chooseButton([get.prompt('ybsl_yiji'), cards], num)
							.set('ai', function () {
								return 1;
							})
							.forResult();
						if (result.bool) {
							event.result = {
								bool: true,
								cards: result.links,
							};
						}
					}
				},
				content() {
					if (!event.cards) {
						event.finish();
					} else {
						player.gain(event.cards, 'gain2');
					}
				},
			},
		},
	},
	ybsl_liangying: {
		enable: 'phaseUse',
		usable: 1,
		filter() {
			return true;
		},
		content() {
			'step 0';
			let cards = player.draw(5);
			event.cardsx = cards;
			('step 1');
			const cardsx = [];
			for (let k of event.cardsx.result) {
				if (player.getCards('h').includes(k)) {
					cardsx.push(k);
				}
			}
			event.cardsxx = cardsx;
			if (cardsx?.length) {
				const ddd = player.YB_liangying(cardsx, true, 3);
				event.ddd = ddd;
			}
			('step 2');
			const list9 = event.ddd.result;
			const listx1 = [];
			for (let j of list9) {
				listx1.push(j[1][0]);
			}
			const cards2 = listx1;
			const cards3 = [];
			const cards4 = event.cardsxx;
			for (let k of cards4) {
				if (player.getCards('h').includes(k) && !cards2.includes(k)) {
					cards3.push(k);
				}
			}
			if (cards3.length) {
				player.addToExpansion(cards3).gaintag.add('ybsl_yiji');
			}
		},
		intro: {
			markcount(storage, player) {
				const content = player.getExpansions('ybsl_yiji');
				return content.length;
			},
			mark(dialog, content, player) {
				content = player.getExpansions('ybsl_yiji');
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						dialog.addAuto(content);
					} else {
						return '共有' + get.cnNumber(content.length) + '张遗计';
					}
				}
			},
			content(content, player) {
				content = player.getExpansions('ybsl_yiji');
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						return get.translation(content);
					}
					return '共有' + get.cnNumber(content.length) + '张遗计';
				}
			},
		},
	},
};
