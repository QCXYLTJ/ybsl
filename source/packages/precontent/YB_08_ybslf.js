import { lib, game, ui, get, ai, _status } from '../../../../../noname.js';
export { YBSL_ybslf };
/**
 * 夜白的自建函数
 */
const YBSL_ybslf = function () {
	{
		/**
		 * 创建一个分配卡牌的事件.
		 * - 遍历输入的元素,根据类型自动识别并赋值给 `cards`、`str` 和 `num`.
		 * - 将 `cards` 中的 `num` 张牌分配给场上角色,分配时的提示信息为 `str`.
		 *
		 * @param {...*} args - 输入的元素(可以是卡牌组、字符串、数字,顺序不固定).
		 * @returns {Object} - 返回创建的事件对象.
		 *
		 * @example
		 * const cards = [{ id: 1, name: '杀' }, { id: 2, name: '闪' }];
		 * const event = lib.element.player.YB_yiji(cards, '请选择一张牌', 1);
		 * console.log(event);
		 */
		lib.element.player.YB_yiji = function (...args) {
			let cards = [];
			let str = '遗计';
			let num;
			let tag = '';
			let fun = function (card, player, target) {
				return true;
			};

			args.forEach((arg) => {
				if (typeof arg === 'object') {
					cards = arg;
				} else if (typeof arg === 'string') {
					if (arg && arg.startsWith('tag:')) {
						tag = arg.slice(4);
					} else {
						str = arg;
					}
				} else if (typeof arg === 'number') {
					num = arg;
				} else if (typeof arg === 'function') {
					fun = arg;
				}
			});

			if (!num) {
				num = cards.length;
			}

			const next = game.createEvent('YB_yiji', false);
			next.player = this;
			next.cards = cards;
			next.number = num;
			next.fun = fun;
			next.tag = tag;
			next.setContent('YB_yiji');
			next.str = str;
			return next;
		};
		lib.element.content.YB_yiji = async function (event, trigger, player) {
			const { cards } = event.cards;
			let num = event.number;
			let num2 = cards.length - num;
			let str = event.str;
			let tag = event.tag;
			const fun =
				event.fun ||
				function (card, player, target) {
					return true;
				};
			if (_status.connectMode) {
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			}
			const given_map = {};
			if (!cards.length) {
				return;
			}

			do {
				const { bool, links } =
					cards.length == 1
						? { links: cards.slice(0), bool: true }
						: await player
							.chooseCardButton(str + '请选择要分配的牌.还可以分配' + (cards.length - num2) + '张牌', true, cards, [1, cards.length - num2])
							.set('ai', () => {
								if (ui.selected.buttons.length == 0) {
									return 1;
								}
								return 0;
							})
							.forResult();
				if (!bool) {
					return;
				}
				cards.removeArray(links);
				const togive = links.slice(0);
				const { targets } = await player
					.chooseTarget('选择一名角色获得' + get.translation(links), true)
					.set('filterTarget', (card, player, target) => {
						if (fun) {
							return fun(card, player, target);
						}
						return true;
					})
					.set('ai', (target) => {
						const att = get.attitude(_status.event.player, target);
						if (_status.event.enemy) {
							return -att;
						} else if (att > 0) {
							return att / (1 + target.countCards('h'));
						} else {
							return att / 100;
						}
					})
					.set('enemy', get.value(togive[0], player, 'raw') < 0)
					.forResult();
				if (targets.length) {
					const id = targets[0].playerid,
						map = given_map;
					if (!map[id]) {
						map[id] = [];
					}
					map[id].addArray(togive);
				}
			} while (cards.length > num2);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			const list = [];
			for (const i in given_map) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				player.line(source, 'green');
				if (player !== source && (get.mode() !== 'identity' || player.identity !== 'nei')) {
					player.addExpose(0.2);
				}
				list.push([source, given_map[i]]);
			}
			game.loseAsync({
				gain_list: list,
				giver: player,
				animate: 'give',
				gaintag: [tag],
			}).setContent('gaincardMultiple');
			event.result = list;
		};
		/**
		 * 创建一个分配卡牌的事件.
		 * - 遍历输入的元素,根据类型自动识别并赋值给 `cards`、`boolyb`、`str` 和 `num`.
		 * - 将 `cards` 中的 `num` 张牌分配给场上角色,分配时的提示信息为 `str`.
		 * - `boolyb` 是一个布尔值,用于控制某些逻辑.
		 * - `boolyb` 是一个布尔值,若为true,则仅从输入卡牌中分配,否则从全部手牌中分配
		 * - fun 是一个函数,用于筛选被分配的目标
		 *
		 * @param {...*} args - 输入的元素(可以是卡牌组、布尔值、字符串、数字,顺序不固定).
		 * @returns {Object} - 返回创建的事件对象.
		 *
		 * @example
		 * const cards = [{ id: 1, name: '杀' }, { id: 2, name: '闪' }];
		 * const event = lib.element.player.YB_liangying(cards, true, '请选择一张牌', 1);
		 * console.log(event);
		 */
		lib.element.player.YB_liangying = function (...args) {
			let cards = [];
			let str = '粮营';
			let num;
			let boolyb = false;
			let filterTarget = function () {
				return true;
			};

			args.forEach((arg) => {
				if (typeof arg === 'object') {
					cards = arg;
				} else if (typeof arg === 'string') {
					str = arg;
				} else if (typeof arg === 'number') {
					num = arg;
				} else if (Array.isArray(arg)) {
					num = arg;
				} else if (typeof arg === 'boolean') {
					boolyb = arg;
				} else if (typeof arg === 'function') {
					filterTarget = arg;
				}
			});

			if (!num) {
				num = [1, cards.length];
			}
			const next = game.createEvent('YB_liangying', false);
			next.player = this;
			next.cards = cards;
			next.number = num;
			next.filterTarget = filterTarget;
			next.setContent('YB_liangying');
			next.boolyb = boolyb;
			next.str = str;
			return next;
		};
		lib.element.content.YB_liangying = async function (event, trigger, player) {
			let maxe, mine;
			if (Array.isArray(event.number)) {
				mine = event.number[0];
				maxe = event.number[1];
			} else {
				mine = event.number;
				maxe = event.number;
			}
			const max = Math.min(maxe, event.boolyb == true ? event.cards.length : player.countCards('he'));
			const min = mine || max;

			let list = [];

			const listx = [];
			if (_status.connectMode) {
				game.broadcastAll(() => (_status.noclearcountdown = true));
			}
			while (max - list.length) {
				const { bool, cards, targets } = await player
					.chooseCardTarget({
						prompt: event.str + ':将' + get.cnNumber(min) + '至' + get.cnNumber(max) + '张牌分配给任意角色',
						position: 'he',
						animate: false,
						filterCard(card, player) {
							if (event.boolyb == true) {
								return event.cards && event.cards.includes(card) && !get.event().list.some((list) => list[1] == card);
							}
							return !get.event().list.some((list) => list[1] == card);
						},

						filterTarget(card, player, target) {
							return event.filterTarget(card, player, target);
						},
						ai1(card) {
							if (card.name == 'shan') {
								return 1;
							}
							return Math.random();
						},
						ai2(target) {
							return get.attitude(get.event().player, target);
						},
					})
					.set('list', list)
					.set('forced', min > list.length)
					.forResult();
				if (bool) {
					listx.push(cards);
					list.push([targets[0], cards[0]]);

					player.addGaintag(cards, 'olsujian_given');
				} else {
					break;
				}
			}
			if (_status.connectMode) {
				game.broadcastAll(() => {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			if (list.length) {
				await game
					.loseAsync({
						gain_list: list,
						player: player,
						cards: list.slice().map((list) => list[1]),
						giver: player,
						animate: 'giveAuto',
					})
					.setContent('gaincardMultiple');
			}

			event.result = list;
			event.resultx = listx;
		};
		/**
		 * 未完成
		 * @param {*} cards
		 * @param {*} str
		 * @param {*} targets
		 * @returns
		 */
		lib.element.player.YB_wugu = function (cards, str, targets) {
			const next = game.createEvent('YB_wugu', false);
			next.player = this;
			next.cards = cards;
			next.setContent('YB_wugu');
			next.str = str;
			next.targets = targets;
			return next;
		};

		lib.element.content.YB_wugu = async function (event, trigger, player) {
			let cards = event.cards;
			let str = event.str;
			const targets = event.targets;
			ui.clear();
			const dialog = ui.create.dialog(str, cards, true);
			_status.dieClose.push(dialog);
			dialog.videoId = lib.status.videoId++;
			game.addVideo('cardDialog', null, [str, get.cardsInfo(cards), dialog.videoId]);
			event.parent.preResult = dialog.videoId;
			game.broadcast(
				function (cards, id) {
					const dialog = ui.create.dialog(str, cards, true);
					_status.dieClose.push(dialog);
					dialog.videoId = id;
				},
				cards,
				dialog.videoId,
			);
			game.log(player, '亮出了', cards);
		};

		/**
		 * 判断`player`的同族角色
		 * - 若`bool`为true,则包括自己,否则不包括自己
		 * - 返回同族角色数组
		 *
		 * @param {Player} player - 角色
		 * @param {boolean} bool - 是否包括自己
		 * @returns 同族角色数组
		 *
		 * @example
		 */
		get.YB_clan = function (player, bool) {
			let list = [];
			game.hasPlayer2((current) => {
				if (current == player && bool) {
					list.push(current);
				} else if (player.getClan().some((i) => current.getClan().includes(i)) && current != player) {
					list.push(current);
				}
			});
			return list;
		};

		get.YB_pu1 = function (player) {
			let skills = player.getSkills(null, false, false);
			const skills2 = game.expandSkills(skills);
			const skills3 = skills2.filter(function (i) {
				if (lib.skill[i].enable && lib.skill[i].enable == 'phaseUse' && lib.skill[i].usable) {
					if (typeof lib.skill[i].usable == 'number') {
						return lib.skill[i].usable == 1;
					} else if (typeof lib.skill[i].usable == 'function') {
						return lib.skill[i].usable(i, player) == 1;
					}
				}
			});
			if (skills3) {
				return skills3;
			} else {
				return [];
			}
		};

		lib.element.player.getClan = function (unseen) {
			let list = [];
			if (unseen || !this.isUnseen(0)) {
				const info = lib.character[this.name1];
				if (info && info[4]) {
					for (let i of info[4]) {
						if (typeof i == 'string' && i.startsWith('clan:')) {
							list.add(i.slice(5));
						}
					}
				}
			}
			if (this.name2 && (unseen || !this.isUnseen(1))) {
				const info = lib.character[this.name2];
				if (info && info[4]) {
					for (let i of info[4]) {
						if (typeof i == 'string' && i.startsWith('clan:')) {
							list.add(i.slice(5));
						}
					}
				}
			}
			return list;
		};

		{
			/**
			 * 夜白神庞统相关函数
			 * - 输出list中未点燃的卡
			 * @param {*} list
			 * @returns
			 */
			get.YB_noflames = function (list) {
				const list2 = Array.from(list).filter((c) => !c.storage.YB_flames);
				return list2;
			};
			/**
			 *
			 * 夜白神庞统相关函数
			 * - 输出list中点燃的卡
			 * @param {*} list
			 * @returns
			 */
			get.YB_flames = function (list) {
				const list2 = Array.from(list).filter((c) => c.storage.YB_flames);
				return list2;
			};
			/**
			 * 夜白神庞统相关函数
			 * - 点燃输入卡组
			 * @param {*} list
			 */
			game.YB_fire = function (list) {
				const list2 = Array.from(list);
				list2.forEach((c) => {
					if (!c.storage.YB_flames) {
						c.storage.YB_flames = true;
						c.classList.add('YB_flames');
					}
				});
			};
			/**
			 * 夜白神庞统相关函数
			 * - 熄灭输入卡组
			 * @param {*} list
			 */
			game.YB_nofire = function (list) {
				const list2 = Array.from(list);
				list2.forEach((c) => {
					if (c.storage.YB_flames) {
						delete c.storage.YB_flames;
						c.classList.remove('YB_flames');
					}
				});
			};

			/**
			 * 夜白神庞统相关函数
			 * - 吸收卡组火焰
			 * @param {*} list
			 */
			lib.element.player.YB_nofire = function (list) {
				let list2 = Array.from(list),
					num = [];
				list2.forEach((c) => {
					if (c.storage.YB_flames) {
						delete c.storage.YB_flames;
						c.classList.remove('YB_flames');
						num.push(c);
					}
				});

				this.addMark('ybsl_ptchiling', num.length, false);
				let cards = get.translation(num);
				game.log(this, '吸收了', '#y' + cards, `的火焰,获得了共计<span style='color:yellow'>${num.length}</span>枚`, '#g火焰', '');
			};
			/**
			 * 夜白神庞统相关函数
			 * - 输出火焰数
			 * @param {*} num
			 * @returns
			 */
			get.YB_fire_num = function (num) {
				switch (num) {
					case 1:
						return 2;
					case 2:
						return 5;
					case 3:
						return 10;
					case 4:
						return 20;
					case 5:
						return 40;
					default:
						return 0;
				}
			};
		}
		{
			lib.skill._ybsl_shiji = {
				firstDo: true,
				forced: true,
				ruleSkill: true,
				trigger: {
					player: ['useSkill', 'logSkillBegin', 'useCard', 'respond'],
				},
				filter(event, player) {
					const skill = get.sourceSkillFor(event);

					return lib.skill[skill]?.YB_shiji;
				},
				content() {
					const skill = get.sourceSkillFor(trigger);
					if (lib.skill[skill].YB_shiji == 'yin') {
						if (player.hasSkill('ybsl_shiji_yang')) {
							player.YB_shiji();
						}
						player.YB_tempy('ybsl_shiji_yin');
					} else {
						if (player.hasSkill('ybsl_shiji_yin')) {
							player.YB_shiji(true);
						}
						player.YB_tempy('ybsl_shiji_yang');
					}
				},
			};
			lib.element.player.YB_shiji = function (i) {
				let str = i ? 'yin' : 'yang';
				game.log(this, '重置了', i ? '#g势极技阴极' : '#g势极技阳极');
				this.removeSkill('ybsl_shiji_' + str);
			};
			lib.skill.ybsl_shiji_yin = {
				charlotte: true,
				skillBlocker(skill, player) {
					return lib.skill[skill].YB_shiji && lib.skill[skill].YB_shiji == 'yin';
				},
				init(player, skill) {
					player.addSkillBlocker(skill);
				},
				onremove(player, skill) {
					player.removeSkillBlocker(skill);
				},
				mark: true,
				marktext: '<span class=thundertext>势</span>',
				intro: {
					name: '势极技',
					content: '本回合不能使用势极技<span class=thundertext>阴极</span>',
				},
			};
			lib.skill.ybsl_shiji_yang = {
				charlotte: true,
				skillBlocker(skill, player) {
					return lib.skill[skill].YB_shiji && lib.skill[skill].YB_shiji == 'yang';
				},
				init(player, skill) {
					player.addSkillBlocker(skill);
				},
				onremove(player, skill) {
					player.removeSkillBlocker(skill);
				},
				mark: true,
				marktext: '<span class=firetext>势</span>',
				intro: {
					name: '势极技',
					content: '本回合不能使用势极技<span class=firetext>阳极</span>',
				},
			};
		}
		get.YB_key = function (list) {
			const list2 = [];
			for (let i in list) {
				list2.push(i);
			}
			return list2;
		};

		/**
		 * 临时获得标记用的子技能并获得标记,若没有对应的子技能会当场创建该自己能
		 * @param { skill } skill - 此参数输入技能id
		 * @param { num } num - 此参数输入获得的标记数
		 */
		lib.element.player.YB_temp = function (skill, num) {
			num = num || 1;
			if (!lib.skill[skill]) {
				lib.skill[skill] = { charlotte: true };
			}
			this.addTempSkill(skill);
			this.addMark(skill, num);
		};
		/**
		 * 临时获得标记用的子技能并静默获得标记,若没有对应的子技能会当场创建该自己能
		 * @param { skill } skill - 此参数输入技能id
		 * @param { num } num - 此参数输入获得的标记数
		 */
		lib.element.player.YB_tempx = function (skill, num) {
			num = num || 1;
			if (!lib.skill[skill]) {
				lib.skill[skill] = { charlotte: true };
			}
			this.addTempSkill(skill);
			this.addMark(skill, num, false);
		};
		/**
		 * 临时获得标记用的子技能并显示该技能标记,若没有对应的子技能会当场创建该自己能
		 * @param { skill } skill - 此参数输入技能id
		 * @param { num } num - 此参数输入获得的标记数
		 */
		lib.element.player.YB_tempy = function (skill, num) {
			num = num || 1;
			if (!lib.skill[skill]) {
				lib.skill[skill] = { charlotte: true };
			}
			this.addTempSkill(skill);
			this.markSkill(skill);
		};
		lib.element.player.YB_tempz = function (skill, keys) {
			if (!lib.skill[skill]) {
				lib.skill[skill] = { charlotte: true };
			}
			this.addTempSkill(skill);
			if (!this.storage[skill]) {
				this.storage[skill] = [];
			}
			if (Array.isArray(keys)) {
				this.storage[skill].addArray(keys);
			} else {
				this.storage[skill].push(keys);
			}
			this.markSkill(skill);
		};

		lib.element.player.YB_HpTo = function (num) {
			const next = game.createEvent('YB_HpTo', false);
			next.num = num;
			next.player = this;
			next.setContent('YB_HpTo');
			return next;
		};
		lib.element.content.YB_HpTo = function () {
			if (num == player.hp) {
				event.finish();
			} else {
				if (num > player.hp) {
					player.hp += num - player.hp;
					if (num > player.maxHp - player.hp) {
						player.maxHp += num - player.maxHp;
					}
				}
				if (num < player.hp) {
					player.hp -= player.hp - num;
				}
				game.log(player, '将体力值调整至了' + get.cnNumber(num) + '点');
				player.update();
			}
		};

		lib.element.player.YB_shelie = function (num, i, log) {
			const next = game.createEvent('YB_shelie', false);
			next.num = num;
			next.i = '涉猎';
			if (i && i !== true) {
				next.i = i;
			}
			if (i == true || log == true) {
				next.k = true;
			}
			next.player = this;
			next.setContent('YB_shelie');
			return next;
		};
		lib.element.content.YB_shelie = function () {
			'step 0';
			event.cards = get.cards(num);
			game.cardsGotoOrdering(event.cards);
			event.videoId = lib.status.videoId++;
			game.broadcastAll(
				function (player, id, cards) {
					let str = event.i;
					if (player == game.me && !_status.auto) {
						str += ':获取花色各不相同的牌';
					}
					const dialog = ui.create.dialog(str, cards);
					dialog.videoId = id;
				},
				player,
				event.videoId,
				event.cards,
			);
			event.time = get.utc();
			game.addVideo('showCards', player, [event.i, get.cardsInfo(event.cards)]);
			game.addVideo('delay', null, 2);
			('step 1');
			let list = [];
			for (const i of cards) {
				list.add(i.suit);
			}
			let k;
			if (event.k == true) {
				k = list.length;
			} else {
				k = [0, Infinity];
			}
			const next = player.chooseButton(k, true);
			next.set('dialog', event.videoId);
			next.set('filterButton', function (button) {
				for (let i = 0; i < ui.selected.buttons.length; i++) {
					if (ui.selected.buttons[i].link.suit == button.link.suit) {
						return false;
					}
				}
				return true;
			});
			next.set('ai', function (button) {
				return get.value(button.link, _status.event.player);
			});
			('step 2');
			if (result.bool && result.links) {
				event.cards2 = result.links;
			} else {
				event.finish();
			}
			('step 3');
			game.broadcastAll('closeDialog', event.videoId);
			const cards2 = event.cards2;
			player.gain(cards2, 'log', 'gain2');
		};
		lib.element.player.YB_fuhan = function (i, type) {
			const next = game.createEvent('YB_fuhan', false);
			next.player = this;
			if (i != 'old' && i != 'tw') {
				next.groupa = i[0];
				next.numa = i[1];
				next.numb = i[2];
				next.band = i[3];
				next.sex = i[4];
				next.zhu = i[5];
				next.banb = type;
			} else {
				next.banb = i;
			}
			next.setContent('YB_fuhan');
			return next;
		};
		lib.element.content.YB_fuhan = function () {
			'step 0';
			if (!event.numa) {
				event.numa = 5;
			}
			if (!event.band) {
				event.band = [];
			}
			if (event.groupa == 'all') {
				delete event.groupa;
			}
			if (!event.zhu) {
				event.zhu == '';
			}
			if (!event.sex || event.sex.length == 0 || event.sex == 'all') {
				event.sex = ['female', 'male', 'double', 'none'];
			}
			if (event.banb == 'old') {
				event.goto(3);
			}
			if (event.banb == 'tw') {
				event.goto(5);
			}
			('step 1');
			let list;
			if (!event.numb) {
				event.numb = 2;
			}
			if (_status.characterlist) {
				list = [];
				for (let i = 0; i < _status.characterlist.length; i++) {
					let name = _status.characterlist[i];
					if (event.sex.includes(lib.character[name][0])) {
						if (!event.groupa) {
							list.push(name);
						} else if (event.groupa.includes(lib.character[name][1])) {
							list.push(name);
						}
					}
				}
			} else if (_status.connectMode) {
				list = get.charactersOL(function (i) {
					return event.groupa.includes(lib.character[i][1]) && event.sex.includes(lib.character[i][0]);
				});
			} else {
				list = get.gainableCharacters(function (info) {
					return event.groupa.includes(info[1]) && event.sex.includes(info[0]);
				});
			}
			const players = game.players.concat(game.dead);
			for (let i = 0; i < players.length; i++) {
				list.remove(players[i].name);
				list.remove(players[i].name1);
				list.remove(players[i].name2);
			}
			if (event.zhu == 'zhu') {
				for (const z of list) {
					if (!lib.character[z][4] || !lib.character[z][4].includes('zhu')) {
						event.band.add(z);
					}
				}
			} else if (event.zhu == 'nozhu') {
				for (const z of list) {
					if (lib.character[z][4] && lib.character[z][4].includes('zhu')) {
						event.band.add(z);
					}
				}
			}
			if (event.band.length) {
				for (const j of event.band) {
					if (list.includes(j)) {
						list.remove(j);
					}
				}
			}
			list = list.randomGets(event.numa);
			let skills = [];
			for (const i of list) {
				skills.addArray(
					(lib.character[i][3] || []).filter(function (skill) {
						const info = get.info(skill);
						return info && !info.zhuSkill && !info.limited && !info.juexingji && !info.hiddenSkill && !info.charlotte && !info.dutySkill;
					}),
				);
			}
			if (!list.length || !skills.length) {
				event.finish();
				return;
			}
			if (player.isUnderControl()) {
				game.swapPlayerAuto(player);
			}
			const switchToAuto = function () {
				_status.imchoosing = false;
				event._result = {
					bool: true,
					skills: skills.randomGets(2),
				};
				if (event.dialog) {
					event.dialog.close();
				}
				if (event.control) {
					event.control.close();
				}
			};
			const tara = get.cnNumber(event.numb);
			const chooseButton = function (list, skills) {
				const event = _status.event;
				if (!event._result) {
					event._result = {};
				}
				event._result.skills = [];
				const rSkill = event._result.skills;
				const dialog = ui.create.dialog('请选择获得至多' + tara + '个技能', [list, 'character'], 'hidden');
				event.dialog = dialog;
				const table = document.createElement('div');
				table.classList.add('add-setting');
				table.style.margin = '0';
				table.style.width = '100%';
				table.style.position = 'relative';
				for (let i = 0; i < skills.length; i++) {
					const td = ui.create.div('.shadowed.reduce_radius.pointerdiv.tdnode');
					td.link = skills[i];
					table.appendChild(td);
					td.innerHTML = '<span>' + get.translation(skills[i]) + '</span>';
					td.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
						if (_status.dragged) {
							return;
						}
						if (_status.justdragged) {
							return;
						}
						_status.tempNoButton = true;
						setTimeout(function () {
							_status.tempNoButton = false;
						}, 500);
						const link = this.link;
						if (!this.classList.contains('bluebg')) {
							if (rSkill.length >= event.numb) {
								return;
							}
							rSkill.add(link);
							this.classList.add('bluebg');
						} else {
							this.classList.remove('bluebg');
							rSkill.remove(link);
						}
					});
				}
				dialog.content.appendChild(table);
				dialog.add('　　');
				dialog.open();
				event.switchToAuto = function () {
					event.dialog.close();
					event.control.close();
					game.resume();
					_status.imchoosing = false;
				};
				event.control = ui.create.control('ok', function (link) {
					event.dialog.close();
					event.control.close();
					game.resume();
					_status.imchoosing = false;
				});
				for (let i = 0; i < event.dialog.buttons.length; i++) {
					event.dialog.buttons[i].classList.add('selectable');
				}
				game.pause();
				game.countChoose();
			};
			if (event.isMine()) {
				chooseButton(list, skills);
			} else if (event.isOnline()) {
				event.player.send(chooseButton, list, skills);
				event.player.wait();
				game.pause();
			} else {
				switchToAuto();
			}
			('step 2');
			const map = event.result || result;

			player.addSkills(map.skills);
			game.broadcastAll(function (list) {
				game.expandSkills(list);
				for (const i of list) {
					const info = lib.skill[i];
					if (!info) {
						continue;
					}
					if (!info.audioname2) {
						info.audioname2 = {};
					}
					info.audioname2.old_yuanshu = 'weidi';
				}
			}, map.skills);
			event.result = map;
			event.finish();
			('step 3');
			event.num = event.numa;
			let list1;
			if (!event.numb) {
				event.numb = player.name1 || player.name;
			}
			if (_status.characterlist) {
				list1 = [];
				for (let i = 0; i < _status.characterlist.length; i++) {
					let name = _status.characterlist[i];
					if (event.sex.includes(lib.character[name][0])) {
						if (!event.groupa) {
							list1.push(name);
						} else if (event.groupa.includes(lib.character[name][1])) {
							list1.push(name);
						}
					}
				}
			} else if (_status.connectMode) {
				list1 = get.charactersOL(function (i) {
					return event.groupa.includes(lib.character[i][1]) && event.sex.includes(lib.character[i][0]);
				});
			} else {
				list1 = get.gainableCharacters(function (info) {
					return event.groupa.includes(info[1]) && event.sex.includes(info[0]);
				});
			}
			const players1 = game.players.concat(game.dead);
			for (let i = 0; i < players1.length; i++) {
				list1.remove(players1[i].name);
				list1.remove(players1[i].name1);
				list1.remove(players1[i].name2);
			}
			if (event.zhu == 'zhu') {
				for (const z of list1) {
					if (!lib.character[z][4] || !lib.character[z][4].includes('zhu')) {
						event.band.add(z);
					}
				}
			} else if (event.zhu == 'nozhu') {
				for (const z of list1) {
					if (lib.character[z][4] && lib.character[z][4].includes('zhu')) {
						event.band.add(z);
					}
				}
			}
			if (event.band.length) {
				for (const j of event.band) {
					if (list1.includes(j)) {
						list1.remove(j);
					}
				}
			}

			const kkk = get.translation(event.numb);
			player
				.chooseButton(true)
				.set('ai', function (button) {
					return get.rank(button.link, true) - lib.character[button.link][2];
				})
				.set('createDialog', ['将' + kkk + '替换为一名角色', [list1.randomGets(event.num), 'character']]);
			('step 4');

			player.reinit(event.numb, result.links[0], false);
			if (_status.characterlist) {
				_status.characterlist.add(event.numb);
				_status.characterlist.remove(result.links[0]);
			}
			event.result = result;
			event.finish();
			('step 5');
			event.num = event.numa;
			let list2;
			if (_status.characterlist) {
				list2 = [];
				for (let i = 0; i < _status.characterlist.length; i++) {
					let name = _status.characterlist[i];
					if (event.sex.includes(lib.character[name][0])) {
						if (!event.groupa) {
							list2.push(name);
						} else if (event.groupa.includes(lib.character[name][1])) {
							list2.push(name);
						}
					}
				}
			} else if (_status.connectMode) {
				list2 = get.charactersOL(function (i) {
					return event.groupa.includes(lib.character[i][1]) && event.sex.includes(lib.character[i][0]);
				});
			} else {
				list2 = get.gainableCharacters(function (info) {
					return event.groupa.includes(info[1]) && event.sex.includes(info[0]);
				});
			}
			const players2 = game.players.concat(game.dead);
			for (let i = 0; i < players2.length; i++) {
				list2.remove(players2[i].name);
				list2.remove(players2[i].name1);
				list2.remove(players2[i].name2);
			}
			if (event.zhu == 'zhu') {
				for (const z of list2) {
					if (!lib.character[z][4] || !lib.character[z][4].includes('zhu')) {
						event.band.add(z);
					}
				}
			} else if (event.zhu == 'nozhu') {
				for (const z of list2) {
					if (lib.character[z][4] && lib.character[z][4].includes('zhu')) {
						event.band.add(z);
					}
				}
			}
			if (event.band.length) {
				for (const j of event.band) {
					if (list2.includes(j)) {
						list2.remove(j);
					}
				}
			}
			const ttt = get.translation(event.numb);
			player.chooseButton([ttt + ':选择获得一张武将牌上的所有技能', [list2.randomGets(event.num), 'character']], true);
			('step 6');
			if (result.bool) {
				let name = result.links[0];
				player.flashAvatar(event.numb, name);
				game.log(player, '获得了', '#y' + get.translation(name), '的所有技能');
				player.addSkill(lib.character[name][3]);
				event.result = result;
			}
		};

		get.YB_tobo = function (cards) {
			let list = [];
			for (const i of cards) {
				list.push(get.translation(i));
			}
			return list;
		};

		get.YB_tobo2 = function (cards) {
			let list = '';
			for (const i of cards) {
				list += get.translation(i);
			}
			return list;
		};

		get.YB_tobo3 = function (cards) {
			let list = '';
			for (const i of cards) {
				if (i != cards[0]) {
					list += '、';
				}
				list += get.translation(i);
			}
			return list;
		};

		get.YB_map = function (list, map) {
			const list2 = [];
			for (const i of list) {
				list2.push(map[i]);
			}
			return list2;
		};

		get.YB_suit = function (cards, i) {
			const atk = get[i] || get.suit;
			const list2 = [];
			for (let k of cards) {
				if (list2.length == 0 || !list2.includes(atk(k))) {
					list2.add(atk(k));
				}
			}
			return list2;
		};

		get.YB_cobo = function (map) {
			let list = [];
			for (let i in map) {
				list.push(i);
			}
			return list;
		};

		get.YB_type = function () {
			const type = [];
			let list = {};
			const listk = [];
			const listn = [];
			for (const i of lib.inpile) {
				if (event[get.type2(i)] != true) {
					type.add(get.translation(get.type2(i)));
					const n = get.type2(i);
					list[n] = get.type2(i);
					listn.add(n);
					listk.add([n, get.translation(get.type2(i))]);
					event[n] = true;
				}
			}
			return listk;
		};

		get.YB_type2 = function (cards) {
			const type = [];
			let list = {};
			const listk = [];
			const listn = [];
			for (const i of cards) {
				if (!listn.length || !listn.includes(get.type2(i))) {
					type.add(get.translation(get.type2(i)));
					const n = get.type2(i);
					list[n] = get.type2(i);
					listn.add(n);
					listk.add([n, get.translation(get.type2(i))]);
				}
			}
			return listk;
		};

		lib.element.player.YB_chongzhu = function (card) {
			'step 0';
			this.loseToDiscardpile(card);
			('step 1');
			this.draw(card.length || 1);
		};

		lib.element.player.YB_zhiheng = function (list) {
			this.discard(list);
			this.draw(list.length);
		};

		lib.element.player.YB_sblijian = function (list) {
			game.countPlayer(function (current) {
				if (list.includes(current)) {
					const targetx = list.slice().sortBySeat(current)[1];
					let card = { name: 'juedou' };
					if (current.canUse(card, targetx)) {
						current.useCard(card, targetx);
					}
				}
			});
		};

		lib.element.player.YB_changeHandCard = function (num) {
			'step 0';
			const num22 = this.countCards('h');
			if (num22 > num) {
				this.chooseToDiscard('h', num22 - num, true);
			} else if (num22 < num) {
				this.draw(num - num22);
			}
		};

		lib.element.content.YB_chooseToChongzhu = function () {
			'step 0';
			event.list = [];
			let cards = player.getCards('h');
			const suits = get.YB_suit(cards);
			player.showCards(cards);
			for (let k = 0; k < suits.length; k++) {
				event.list.add([suits[k], []]);
				for (const j of cards) {
					if (j.suit == suits[k]) {
						event.list[k][1].add(j);
					}
				}
			}
			let list = [],
				list6 = [];
			for (let h = 0; h < event.list.length; h++) {
				list.add(get.translation(event.list[h][0] + '2'));
				list6.add([get.translation(event.list[h][0] + '2') + ':', get.translation(event.list[h][1])]);
			}
			if (!list.length) {
				event.finish();
			} else {
				player.chooseControl(list).set('choiceList', list6).set('prompt', '请选择重铸一种花色的所有牌');
			}
			('step 1');
			player.recast(event.list[result.index][1]);
		};

		lib.element.player.YB_zhongliu = function () {
			const player = this;
			let skills = player.getStockSkills(true, true);
			game.expandSkills(skills);
			const resetSkills = [];
			const suffixs = ['used', 'round', 'block', 'blocker'];
			for (const skill of skills) {
				const info = get.info(skill);
				if (typeof info.usable == 'number') {
					if (player.hasSkill('counttrigger') && player.storage.counttrigger[skill] && player.storage.counttrigger[skill] >= 1) {
						delete player.storage.counttrigger[skill];
						resetSkills.add(skill);
					}
					if (typeof get.skillCount(skill) == 'number' && get.skillCount(skill) >= 1) {
						delete player.getStat('skill')[skill];
						resetSkills.add(skill);
					}
				}
				if (info.round && player.storage[skill + '_roundcount']) {
					delete player.storage[skill + '_roundcount'];
					resetSkills.add(skill);
				}
				if (player.storage[`temp_ban_${skill}`]) {
					delete player.storage[`temp_ban_${skill}`];
				}
				if (player.awakenedSkills.includes(skill)) {
					player.restoreSkill(skill);
					resetSkills.add(skill);
				}
				for (const suffix of suffixs) {
					if (player.hasSkill(skill + '_' + suffix)) {
						player.removeSkill(skill + '_' + suffix);
						resetSkills.add(skill);
					}
				}
			}
			if (resetSkills.length) {
				let str = '';
				for (const i of resetSkills) {
					str += '【' + get.translation(i) + '】、';
				}
				game.log(player, '重置了技能', '#g' + str.slice(0, -1));
			}
		};
		lib.element.player.YB_zhongliuSkills = function (skills) {
			const player = this;
			if (typeof skills == 'string') {
				skills = [skills];
			}
			game.expandSkills(skills);
			const resetSkills = [];
			const suffixs = ['used', 'round', 'block', 'blocker'];
			for (const skill of skills) {
				const info = get.info(skill);
				if (typeof info.usable == 'number') {
					if (player.hasSkill('counttrigger') && player.storage.counttrigger[skill] && player.storage.counttrigger[skill] >= 1) {
						delete player.storage.counttrigger[skill];
						resetSkills.add(skill);
					}
					if (typeof get.skillCount(skill) == 'number' && get.skillCount(skill) >= 1) {
						delete player.getStat('skill')[skill];
						resetSkills.add(skill);
					}
				}
				if (info.round && player.storage[skill + '_roundcount']) {
					delete player.storage[skill + '_roundcount'];
					resetSkills.add(skill);
				}
				if (player.storage[`temp_ban_${skill}`]) {
					delete player.storage[`temp_ban_${skill}`];
				}
				if (player.awakenedSkills.includes(skill)) {
					player.restoreSkill(skill);
					resetSkills.add(skill);
				}
				for (const suffix of suffixs) {
					if (player.hasSkill(skill + '_' + suffix)) {
						player.removeSkill(skill + '_' + suffix);
						resetSkills.add(skill);
					}
				}
			}
			if (resetSkills.length) {
				let str = '';
				for (const i of resetSkills) {
					str += '【' + get.translation(i) + '】、';
				}
				game.log(player, '重置了技能', '#g' + str.slice(0, -1));
			}
		};

		get.YB_1234 = function (list) {
			const list2 = [];
			game.countPlayer(function (current) {
				if (list.includes(current)) {
					list2.push(current);
				}
			});
			return list2;
		};

		get.North_bmh_chizhang = function (player) {
			let list = [];
			let skills = player.getOriginalSkills();
			for (let i = 0; i < skills.length; i++) {
				if (lib.skill[skills[i]].limited && player.awakenedSkills.includes(skills[i])) {
					list.push(skills[i]);
				}
			}
			return list;
		};

		get.YB_tuxivalue = function (player) {
			let check,
				i,
				num = 0,
				num2 = 0,
				players = game.filterPlayer();
			for (let i = 0; i < players.length; i++) {
				if (player != players[i] && players[i].countCards('h')) {
					const att = get.attitude(player, players[i]);
					if (att <= 0) {
						num++;
					}
					if (att < 0) {
						num2++;
					}
				}
			}
			if (num >= 2 && num2 > 0) {
				check = true;
			} else {
				check = false;
			}
			return check;
		};
		get.YB_tuxi2value = function (player, numx) {
			numx = numx || 2;
			let check,
				i,
				num = 0,
				num2 = 0,
				players = game.filterPlayer();
			for (let i = 0; i < players.length; i++) {
				if (player != players[i] && players[i].countCards('h')) {
					const att = get.attitude(player, players[i]);
					if (att <= 0) {
						num++;
					}
					if (att < 0) {
						num2++;
					}
				}
			}
			if (num >= numx && num2 > 0) {
				check = true;
			} else {
				check = false;
			}
			return check;
		};

		get.YB_movevalue = function (player) {
			let check;
			if (!player.canMoveCard(true)) {
				check = false;
			} else {
				check = game.hasPlayer(function (current) {
					return get.attitude(player, current) > 0 && current.countCards('j');
				});
				if (!check) {
					if (player.countCards('h') > player.hp + 1) {
						check = false;
					} else if (player.countCards('h', { name: ['wuzhong'] })) {
						check = false;
					} else {
						check = true;
					}
				}
			}
			return check;
		};

		lib.element.player.YB_levelUp = function (str) {
			for (const i of str) {
				lib.skill[i].levelUp(this);
			}
		};

		lib.element.player.YB_control = function (control, num, str) {
			const next = game.createEvent('YB_control', false);
			next.player = this;
			next.list = control;
			if (typeof num == 'number') {
				next.numb = num;
				next.str = str;
			} else {
				next.str = num;
			}
			next.setContent('YB_control');
			return next;
		};
		lib.element.content.YB_control = function () {
			'step 0';
			event.num = 1;
			if (!event.numb) {
				event.numb = 8;
			}
			if (event.ai == undefined) {
				event.ai = function (control) {
					return 0;
				};
			}
			if (!event.isMine()) {
				event.goto(2);
			}
			('step 1');
			const kd = event.numb;
			const ss = event.list.length;
			const qy = ss % kd;
			let sl;
			if (event.num * kd > ss) {
				sl = qy;
			} else {
				sl = kd;
			}
			let list = [];
			if (event.num > 1) {
				list.push('上页');
			}
			for (let i = 0; i < sl; i++) {
				const t = (event.num - 1) * kd + i;
				list.push(event.list[t]);
			}
			if (ss > kd * event.num) {
				list.push('下页');
			}
			list.push('cancel2');
			let str = event.str ? event.str : '<span class=yellowtext>请选择一项:</span>';
			player.chooseControl(list).set('prompt', str);
			('step 2');
			if (result.control == '上页') {
				event.num--;
				event.goto(1);
			} else if (result.control == '下页') {
				event.num++;
				event.goto(1);
			} else if (!event.isMine()) {
				let list = [];
				for (let i = 0; i < event.list.length; i++) {
					list.push(event.list[i]);
				}
				list.push('cancel2');
				player.chooseControl(list).set('prompt', '\u6b63\u5e38\u6765\u8bf4\uff0c\u8fd9\u4e2a\u9009\u62e9\u7684\u6309\u94ae\u53ea\u4f1a\u5c55\u793a\u7ed9\u0061\u0069\uff0c\u5047\u5982\u4f60\u770b\u5230\u8fd9\u6bb5\u8bdd\uff0c\u4f60\u5c31\u8981\u601d\u8003\u4e00\u4e0b\uff0c\u662f\u4e0d\u662f\u505a\u4e86\u4ec0\u4e48\u8ff7\u60d1\u884c\u4e3a\uff0c\u6bd4\u5982\u6258\u7ba1\u4e2d\u7a81\u7136\u63a5\u624b\u4e4b\u7c7b\u7684\u3002&#19981;&#36807;&#20320;&#21487;&#20197;&#25226;&#36825;&#20010;&#39029;&#38754;&#25130;&#22270;&#21457;&#36827;&#32676;&#37324;&#65292;&#39318;&#20010;&#21457;&#29616;&#24182;&#25130;&#22270;&#21457;&#36827;&#22812;&#30333;&#32676;&#37324;&#30340;&#65292;&#20250;&#33719;&#36192;&#31070;&#31192;&#22836;&#34900;&#19968;&#20010;&#12290;').set('ai', event.ai);
			}
			('step 3');
			event.result = result;
		};

		lib.element.player.YB_yuqi = function (i, target) {
			const next = game.createEvent('YB_yuqi', false);
			next.player = this;

			next.list2 = i;

			if (target) {
				next.target = target;
			}

			next.setContent('YB_yuqi');
			return next;
		};
		lib.element.content.YB_yuqi = function () {
			'step 0';
			event.list = event.list2;
			if (!event.target) {
				event.target = player;
			}
			let cards = get.cards(event.list[1]);
			event.cards = cards;
			game.cardsGotoOrdering(cards);
			let str = event.list[0];
			str += '(若对话框显示不完整,可下滑操作)';
			const next = player.chooseToMove(true, str);
			next.set('list', [['牌堆顶的牌', cards], ['交给' + get.translation(event.target) + '(至少一张' + (event.list[2] > 1 ? ',至多' + get.cnNumber(event.list[2]) + '张' : '') + ')'], ['交给自己(至多' + get.cnNumber(event.list[3]) + '张)']]);
			next.set('filterMove', function (from, to, moved) {
				const info = event.list2;
				if (to == 1) {
					return moved[1].length < info[2];
				}
				if (to == 2) {
					return moved[2].length < info[3];
				}
				return true;
			});
			next.set('processAI', function (list) {
				let cards = list[0][1].slice(0).sort(function (a, b) {
					return get.value(b, 'raw') - get.value(a, 'raw');
				}),
					player = _status.event.player,
					target = event.target;
				const info = event.list2;
				const cards1 = cards.splice(0, Math.min(info[3], cards.length - 1));
				let card2;
				if (get.attitude(player, target) > 0) {
					card2 = cards.shift();
				} else {
					card2 = cards.pop();
				}
				return [cards, [card2], cards1];
			});
			next.set('filterOk', function (moved) {
				return moved[1].length;
			});
			('step 1');
			if (result.bool) {
				const moved = result.moved;
				cards.removeArray(moved[1]);
				cards.removeArray(moved[2]);
				while (cards.length) {
					ui.cardPile.insertBefore(cards.pop().fix(), ui.cardPile.firstChild);
				}
				let list = [[event.target, moved[1]]];
				if (moved[2].length) {
					list.push([player, moved[2]]);
				}
				game.loseAsync({
					gain_list: list,
					giver: player,
					animate: 'gain2',
				}).setContent('gaincardMultiple');
			}
		};

		lib.element.player.FY_24 = function (cards, log) {
			const next = game.createEvent('FY_24', false);
			next.player = this;
			next.list2 = cards;
			next.log = '算演';
			if (log) {
				next.log = log;
			}
			next.setContent('FY_24');
			return next;
		};
		lib.element.content.FY_24 = function () {
			'step 0';
			let cards = event.list2;
			game.cardsGotoOrdering(cards);
			event.cards = cards;
			const dialog = ui.create.dialog(event.log, cards, true);
			event.dialog = dialog;
			event.list2 = [];
			if (Array.isArray(event.cards)) {
				for (const i of event.cards) {
					event.list2.push(i.number);
				}
			}
			event.list2.sort(function (a, b) {
				return a - b;
			});
			if (!event.isMine()) {
				player.popup('计算成功!');
				player.gain(cards, 'gain2').gaintag.add('delta_sy');
				player.addTempSkill('delta_sy_1');
				event.dialog.close();
				event.finish();
			}
			('step 1');
			event.list = [];
			for (let i = 0; i < event.list2.length; i++) {
				event.list.push(event.list2[i]);
			}
			event.log = '';
			('step 2');
			player.chooseControl(event.list).set('prompt', '请选择要算的第一个数字');
			('step 3');
			event.num1 = result.control;
			event.list.splice(event.list.indexOf(event.num1), 1);
			player.chooseControl(event.list).set('prompt', '刚才选择了' + event.num1 + ',请选择要算的第二个数字');
			('step 4');
			event.num2 = result.control;
			event.list.splice(event.list.indexOf(event.num2), 1);
			player.chooseControl(['+', '-', '*', '/', '重做', '放弃']).set('prompt', '要把' + event.num1 + '和' + event.num2 + '怎麼樣呢');
			('step 5');
			if (result.control == '+') {
				event.count = event.num1 + event.num2;
				const log = event.num1 + +event.num2 + ' = ' + event.count;
				event.log += log;
			}
			if (result.control == '-') {
				let num = event.num1 - event.num2;
				if (num > 0) {
					event.count = num;
					const log = event.num1 + ' - ' + event.num2 + ' = ' + event.count;
					event.log += log;
				} else {
					event.count = -num;
					const log = event.num2 + ' - ' + event.num1 + ' = ' + event.count;
					event.log += log;
				}
			}
			if (result.control == '*') {
				event.count = event.num1 * event.num2;
				const log = event.num1 + ' * ' + event.num2 + ' = ' + event.count;
				event.log += log;
			}
			if (result.control == '/') {
				const result = event.num1 / event.num2;
				event.count = result;
				const log = event.num1 + ' / ' + event.num2 + ' = ' + event.count;
				event.log += log;
			}
			if (result.control == '重做') {
				event.goto(1);
			}
			if (result.control == '放弃') {
				event.goto(8);
			}
			('step 6');
			event.list.push(event.count);
			('step 7');
			if (event.list.length != 1) {
				event.log += ' ;<br> ';
				event.goto(2);
			} else if (Math.abs(event.list[0] - 24) < 0.0001) {
				event.goto(8);
			} else {
				player.popup(event.log + '算错了');
				game.log('本次计算展示数字为:<span class=bluetext>' + event.list2 + '</span>,计算公式如下<br><span class=yellowtext> ' + event.log + ',但是计算错误~ </span>');
				event.goto(1);
			}
			('step 8');
			if (event.list.length == 1 && Math.abs(event.list[0] - 24) < 0.0001) {
				player.popup('成功!');
				event._result = { FY_24: 'victoey' };
				game.log('本次计算展示数字为:<span class=bluetext>' + event.list2 + '</span>,计算公式如下<br><span class=yellowtext> ' + event.log + ' ,计算正确!</span>');
				event.dialog.close();
				event.goto(9);
			} else {
				player.popup('失败!');
				event._result = { FY_24: 'defeat' };
				game.log('本次计算展示数字为:<span class=bluetext>' + event.list2 + '</span>,但是未能成功计算');
				event.dialog.close();
				event.goto(9);
			}
			('step 9');
			event.result = result;
		};

		lib.element.player.addMaxHp = function (num, num2) {
			this.gainMaxHp(num || 1);
			this.recover(num2 || num || 1);
		};
		lib.element.player.YB_rua = function (str) {
			lib.card['YB_' + get.pinyin(str)] = {
				fullimage: true,
				image: 'character:' + get.pinyin(str),
			};
			let card = game.creatCard('YB_' + get.pinyin(str));
			player.$gain2(card);
			game.log(this, '摸了摸', str);
		};

		lib.element.player.YB_playTurnCard = function () {
			const next = game.createEvent('YB_playTurnCard', false);
			next.player = this;
			next.setContent('YB_playTurnCard');
			return next;
		};
		lib.element.content.YB_playTurnCard = function () { };

		lib.element.player.YB_name = function () {
			const next = game.createEvent('YB_name', false);
			next.player = this;
			next.setContent('YB_name');
			return next;
		};
		lib.element.content.YB_name = function () {
			'step 0';
			const dialog1 = ui.create.dialog(false);
			dialog1.add('【命名】<br>请输入你要命的名~');
			dialog1.add('\u6211\u7279\u610f\u6ca1\u5220\u5e72\u51c0\uff0c\u8fd9\u6837\u4f60\u624d\u4f1a\u77e5\u9053\uff0c\u539f\u6765\u6211\u6284\u4e86\u9b54\u738b');
			const div = document.createElement('div');
			const input1 = div.appendChild(document.createElement('input'));
			input1.type = 'text';
			input1.setAttribute('maxlength', '20');
			input1.addEventListener('keydown', (e) => {
				e.stopPropagation();
			});
			input1.addEventListener('keyup', (e) => {
				e.stopPropagation();
			});
			input1.placeholder = '请输入喵~';
			dialog1.add(div);
			event.dialog = dialog1;
			event.input = input1;
			('step 1');
			const { dialog, input } = event;
			const clickFun = () => {
				dialog.remove();
				const value = input.value;
				event.text = input.value;
				game.resume();
			};
			if (event.isMine()) {
				dialog.open();
				game.pause();
				const button = ui.create.control('确定', () => {
					if (!input.value) {
						return alert('输入不能为空');
					}
					button.remove();
					clickFun();
				});
			} else if (event.isOnline()) {
				input.value = '未命名';
				clickFun();
			} else {
				input.value = '未命名';
				clickFun();
			}
			event.resume();
		};

		lib.element.player.FY_chooseText = function chooseText() {
			const next = game.createEvent('FY_chooseText');
			for (let i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == 'boolean') {
					next.forced = arguments[i];
				} else if (Array.isArray(arguments[i])) {
					next.filterText = arguments[i];
				} else if (typeof arguments[i] == 'function') {
					if (next.ai) {
						next.filterText = arguments[i];
					} else {
						next.ai = arguments[i];
					}
				} else if (typeof arguments[i] == 'string') {
					get.evtprompt(next, arguments[i]);
				} else if (get.itemtype(arguments[i]) == 'dialog') {
					next.dialog = arguments[i];
				} else if (typeof arguments[i] == 'number') {
					next.max = arguments[i];
				}
				if (next.forced == undefined) {
					next.forced = false;
				}
			}
			next.player = this;
			next.setContent('FY_chooseText');
			next._args = Array.from(arguments);
			next.forceDie = true;
			return next;
		};
		lib.element.content.FY_chooseText = function chooseTextContent() {
			'step 0';
			if (event.isMine()) {
				if (event.dialog) {
					event.dialog.open();
				} else if (event.prompt) {
					event.dialog = ui.create.dialog(event.prompt);
					if (event.prompt2) {
						event.dialog.addText(event.prompt2, event.prompt2.length <= 20);
					}
				}
				event.result = {};
				const div = document.createElement('div');
				const input = div.appendChild(document.createElement('input'));
				input.style.background = 'while';
				input.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=50,finishOpacity=40)';
				input.style.opacity = '1';
				input.style.width = '100%';
				input.style.fontSize = '20px';
				input.style.textAlign = 'center';
				input.style.color = '#e328b7';
				input.addEventListener('keydown', (e) => e.stopPropagation());
				input.addEventListener('keyup', (e) => e.stopPropagation());
				input.placeholder = '请在此输入文本';
				input.setAttribute('maxlength', event.max);
				event.dialog.add(div);
				game.pause();
				game.countChoose();
				event.choosing = true;
				const button = ui.create.control('确定', () => {
					if (event.filterText) {
						if (typeof event.filterText == 'function') {
							event.filterText = event.filterText();
						}
						if (!event.filterText.includes(input.value)) {
							return alert('您输入的内容不合要求');
						}
					}
					event.result.bool = true;
					event.result.text = input.value ? input.value : '';
					doClose();
				});
				let cancel;
				if (!event.forced) {
					cancel = ui.create.control('取消', () => {
						event.result.bool = false;
						doClose();
					});
				}
				event.switchToAuto = () => {
					event.result = 'ai';
					doClose();
				};
				const doClose = () => {
					button.remove();
					if (cancel) {
						cancel.remove();
					}
					game.resume();
				};
			} else if (event.isOnline()) {
				event.send();
			} else {
				event.result = 'ai';
			}
			('step 1');
			if (event.result == 'ai') {
				if (event.ai) {
					event.value = event.ai(event.parent, player);
				}
				event.result = {};
				event.result.bool = event.value != -1 || event.forced;
				if (event.result.bool) {
					event.result.text = event.value;
				}
			}
			_status.imchoosing = false;
			event.choosing = false;
			if (event.dialog) {
				event.dialog.close();
			}
			event.resume();
		};

		game.YB_createCard = function (name, suit, number, nature, tag) {
			if (typeof name == 'object') {
				nature = name.nature;
				number = name.number;
				suit = name.suit;
				name = name.name;
			}
			if (typeof name != 'string') {
				name = 'sha';
			}
			let noclick = false;
			if (suit == 'noclick') {
				noclick = true;
				suit = null;
			}
			if (!suit && lib.card[name].cardcolor) {
				suit = lib.card[name].cardcolor;
			}
			if (!nature && lib.card[name].cardnature) {
				nature = lib.card[name].cardnature;
			}
			if (typeof suit != 'string') {
				suit = ['heart', 'diamond', 'club', 'spade'].randomGet();
			} else if (suit == 'black') {
				suit = Math.random() < 0.5 ? 'club' : 'spade';
			} else if (suit == 'red') {
				suit = Math.random() < 0.5 ? 'diamond' : 'heart';
			}
			if (typeof number != 'number' && typeof number != 'string') {
				number = Math.ceil(Math.random() * 13);
			}
			let card;
			if (noclick) {
				card = ui.create.card(ui.special, 'noclick', true);
			} else {
				card = ui.create.card(ui.special);
			}
			card.storage.vanish = true;
			return card.init([suit, number, name, nature, tag]);
		};
		get.YB_tag = function (card) {
			const tags = [];
			if (!_status.cardtag) {
				_status.cardtag = {};
			}
			for (const m in _status.cardtag) {
				if (_status.cardtag[m].includes(card.cardid)) {
					tags.add(m);
				}
			}
			return tags;
		};
		lib.element.card.YB_init = function (...objects) {
			const id = this.cardid;
			this.init(...objects);
			this.cardid = id;
		};

		get.YB_chongzhijiList = function (player, skill) {
			if (!player.storage[skill + '_chongzhijiList']) {
				player.storage[skill + '_chongzhijiList'] = [];
				if (lib.skill[skill].chongzhijiList) {
					player.storage[skill + '_chongzhijiList'] = lib.skill[skill].chongzhijiList;
				}
			}
			return player.storage[skill + '_chongzhijiList'];
		};
		get.YB_chongzhiList = function (player, skill) {
			if (!player.storage[skill] || player.storage[skill].length == 0) {
				player.storage[skill] = [];
				if (player.storage[skill + '_chongzhijiList']) {
					for (let i = 0; i < player.storage[skill + '_chongzhijiList'].length; i++) {
						player.storage[skill].add(player.storage[skill + '_chongzhijiList'][i]);
					}
				}
			}
			return player.storage[skill];
		};

		/**
		 * 判断该角色一次性失去多少张手牌会不再是手牌数最多
		 * @param {player} target
		 */
		get.YB_cardMaxLose = function (target) {
			const players = game.filterPlayer((c) => c != target);
			let numb = 0;
			for (const i of players) {
				if (i.countCards('h') > numb) {
					numb = i.countCards('h');
				}
			}
			return target.countCards('h') + 1 - numb;
		};
		lib.element.player.YB_recover = function (num) {
			const next = game.createEvent('YB_recover');
			next.player = this;
			next.num = num;
			next.setContent('YB_recover');
			return next;
		};
		lib.element.content.YB_recover = function () {
			const n1 = num,
				n2 = player.getDamagedHp();
			if (n1 > n2) {
				const n3 = n1 - n2;
				player.recover(n2);
				player.gainMaxHp(n3);
			} else {
				player.recover(n1);
			}
		};

		/**
		 * 交换主副将函数
		 * @returns
		 */
		lib.element.player.YB_exchange = function () {
			const next = game.createEvent('YB_exchange');
			next.player = this;
			next.setContent(function () {
				'step 0';
				game.log(player, '交换了主副将');
				if (player.name2 == undefined) {
					player.changeCharacter([player.name1]);
				} else {
					player.changeCharacter([player.name2, player.name1]);
					player.node.avatar.setBackground(player.name2, 'character');
					player.node.name.innerHTML = get.slimName(player.name2);
				}
				player.update();
			});
			return next;
		};
		/**
		 * 用来给一个卡牌或伤害添加属性
		 * @param {卡牌或伤害事件} trigger 需要被增加属性的对象
		 * @param {属性的字符串} nature 需要加进去的属性
		 */
		game.YB_addNature = function (trigger, nature) {
			let natures = trigger.nature;

			if (natures == null || natures == '' || natures == undefined) {
				natures = [];
			}
			if (!Array.isArray(natures)) {
				if (typeof natures == 'string') {
					if (natures.includes('|')) {
						natures = natures.split('|').filter((item) => item !== '');
					} else {
						natures = [natures];
					}
				}
			}
			if (!natures.includes(nature)) {
				natures.push(nature);
			}
			let naturex;
			if (Array.isArray(natures)) {
				naturex = natures.join('|');
			}

			game.setNature(trigger, naturex);
		};
	}
	{
		get.YB_characterImage = function (character) {
			if (lib.character[character].img !== undefined) {
				return lib.character[character].img;
			} else if (lib.character[character][4]) {
				const infoy = lib.character[character][4];

				for (const infox of infoy) {
					if (infox.startsWith('ext:')) {
						const sta = infox.slice(4);

						return sta;
					} else if (infox.startsWith('img:')) {
						const sta = infox.slice(4);

						return sta;
					} else {
						return `image/character/${character}.jpg`;
					}
				}
			} else {
				return `image/character/${character}.jpg`;
			}
		};
	}

	{
		lib.element.card.YB_characterToCard = function (
			character,
			card = {
				fullimage: true,
				image: 'character:' + character,
				type: 'equip',
				subtype: 'equip1',
				enable: true,
				selectTarget: -1,
				filterTarget(card, player, target) {
					if (player != target) {
						return false;
					}
					return target.canEquip(card, true);
				},
				modTarget: true,
				allowMultiple: false,
				content: lib.element.content.equipCard,
				toself: true,
				ai: {},
			},
			translate = {
				name: lib.translate[character + '_ab'] ? lib.translate[character + '_ab'] : lib.translate[character],
				info: lib.character[character],
			},
			remove = false,
			player = null,
		) {
			game.broadcastAll(
				function (player, character) {
					player.tempname.addArray(character);
				},
				player,
				character,
			);
		};
		/**
		 * ,content=function(){
			var name = character;
			var info = lib.character[name];
			var maxHp = get.infoMaxHp(info[2]);
			if (maxHp != 1) {
				card.distance = { attackFrom: 1 - maxHp };
			}
			var skills = info[3].filter(function (skill) {
				var info = get.skillInfoTranslation(skill);
				if (!info.includes("【杀】")) {
					return false;
				}
				var list = get.skillCategoriesOf(skill, get.player());
				list.remove("锁定技");
				return list.length == 0;
			});
			var str = "锁定技.";
			if (skills.length) {
				card.skills.addArray(skills);
				str += "你视为拥有技能";
				for (var skill of skills) {
					str += "〖" + get.translation(skill) + "〗";
					str += "、";
				}
				str = str.slice(0, str.length - 1);
				str += ";";
				card.ai.equipValue = function (card, player) {
					let val = maxHp;
					val *= 0.6;
					return (val += skills.length);
				};
			}
			if(remove){
				if(remove.translate)str+=remove.translate;
			}
			
			lib.translate["YB_characterToCard_" + name + "_info"] = str;
			var append = "";
			if (skills.length) {
				for (var skill of skills) {
					if (lib.skill[skill].nobracket) {
						append += '<div class="skilln">' + get.translation(skill) + '</div><div><span style="font-family: yuanli">' + get.skillInfoTranslation(skill) + "</span></div><br><br>";
					} else {
						var translation = lib.translate[skill + "_ab"] || get.translation(skill).slice(0, 2);
						append += '<div class="skill">【' + translation + '】</div><div><span style="font-family: yuanli">' + get.skillInfoTranslation(skill) + "</span></div><br><br>";
					}
				}
				str = str.slice(0, str.length - 8);
			}
			lib.translate["YB_characterToCard_" + name + "_append"] = append;
			lib.card["YB_characterToCard_" + name] = card;
			event.onlyContent = true;
		}
		 */
	}

	{
		lib.element.player.YB_drawCard = function () {
			const next = game.createEvent('YB_drawCard');
			next.player = this;
			for (let i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] === 'number') {
					next.num = arguments[i];
				} else if (typeof arguments[i] === 'function') {
					next.fun = arguments[i];
					next.filter = Array.from(arguments).slice(i + 1);
					break;
				} else if (typeof arguments[i] === 'object' && !Array.isArray(arguments[i])) {
					const ctrl = arguments[i];
					next.fun = (function getCards() {
						return function (num) {
							if (typeof num != 'number') {
								num = 1;
							}
							if (num <= 0) {
								return [];
							}
							let list = [];
							if (num > 0) {
								for (const i of ui.cardPile.childNodes) {
									const types = Object.keys(ctrl);
									for (const type in ctrl) {
										const typename = ctrl[type];
										if (type != 'bkts') {
											if (type == 'tag') {
												if (typename.startsWith('!')) {
													if (get[type](i, typename.slice(1))) {
														i.bool = false;
													}
												} else if (!get[type](i, typename)) {
													i.bool = false;
												}
											} else {
												if (typename.startsWith('!')) {
													if (get[type](i) == typename.slice(1)) {
														i.bool = false;
													}
												} else if (get[type](i) != typename) {
													i.bool = false;
												}
											}
										}
									}
									if (i.bool != false) {
										list.push(i);
										i.bool = false;
									}
									if (list.length >= num) {
										break;
									}
								}
								if (list.length < num && !ctrl.bkts) {
									list.addArray(get.cards(num - list.length));
								}
							}
							return list;
						};
					})(ctrl);
					next.filter = Array.from(arguments).slice(i + 1);
					break;
				}
			}
			next.setContent(function () {
				'step 0';
				player.draw(num, event.filter).set('otherGetCards', event.fun).gaintag = event.gaintag || [];
			});
			return next;
		};
	}

	{
		get.YB_mjz = function (name) {
			if (lib.character[name].YB_mjz) {
				return lib.character[name].YB_mjz;
			} else {
				const infox = lib.character[name][4];
				for (let i in infox) {
					if (infox[i].startsWith('YB_mjz:')) {
						return infox[i].slice(7);
					}
				}
				return false;
			}
		};
	}

	{
		lib.element.player.YB_zhuanhuanCard = function (card) {
			const next = game.createEvent('YB_zhuanhuanCard');
			next.player = this;
			next.card = card;
			next.setContent(function () {
				'step 0';
				event.trigger('YB_zhuanhuanCard');
				('step 1');
				game.broadcastAll(
					function (card, player) {
						if (!card.storage || !card.storage.zhuanhuanNum) {
							card.storage.zhuanhuanNum = 0;
						}
						let num = card.storage.zhuanhuanNum % card.storage.zhuanhuanList.length;
						if (card.storage.zhuanhuanList[num]) {
							game.log(player, '转换了', card);

							card.storage.zhuanhuanNum++;
						}
					},
					card,
					player,
				);
			});
		};
		get.zhuanhuanCard = function (card) {
			if (card.storage.zhuanhuanList && card.storage.zhuanhuanList.length) {
				return true;
			} else {
				return lib.card[card.name].zhuanhuanList;
			}
		};
	}
};
