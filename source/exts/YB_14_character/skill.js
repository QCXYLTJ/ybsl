import { lib, game, ui, get, ai, _status } from '../../../../../noname.js';
export { skill };
/** @type { importCharacterConfig.skill } */
const skill = {
	ybsl_ptchiling: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: ['gameStart'],
			player: 'enterGame',
		},
		filter(event, player, name) {
			if (name == 'gameStart' || game.phaseNumber == 0) {
				return true;
			}
		},
		content() {
			game.log("<span style='color: #ff7b00'>牌堆燃起来了!!!</span>");
			game.YB_fire(ui.cardPile.childNodes);
		},
		group: ['ybsl_ptchiling_eat', 'ybsl_ptchiling_1', 'ybsl_ptchiling_2', 'ybsl_ptchiling_3'],
		mark: true,
		marktext: '焰',
		intro: {
			name: '火焰',
			content: '$',
		},
		derivation: 'ybsl_ptchiling_eat',
		subSkill: {
			eat: {
				name: '炽翎·吸收',
				audio: 'ybsl_ptchiling',
				trigger: {
					global: ['loseAfter', 'cardsDiscardAfter', 'loseAsyncAfter'],
				},
				filter(event, player) {
					if (event.name.indexOf('lose') == 0) {
						if (event.getlx === false || event.position != ui.discardPile) {
							return false;
						}
					}
					return get.YB_flames(event.cards).length && get.YB_flames(event.cards).length;
				},
				content() {
					player.YB_nofire(trigger.cards);
				},
				prompt(event, player) {
					let list = get.YB_flames(event.cards);
					list = get.translation(list);

					return `是否吸收<span style=\'color: #1eff00\'>${list}</span>的火焰？`;
				},
				check() {
					return true;
				},
				forced: true,
			},
			1: {
				name: '炽翎·火伤',
				audio: 'ybsl_ptchiling',
				usable: 1,
				enable: 'phaseUse',
				filter(event, player) {
					return player.countMark('ybsl_ptchiling') >= 2;
				},
				chooseButton: {
					dialog(event, player) {
						let list = [];
						for (let i = 1; i < 4; i++) {
							list.push(['消耗', get.YB_fire_num(i), 'ybsl_ptchiling' + i]);
						}
						return ui.create.dialog('炽翎', [list, 'vcard']);
					},
					filter(button, player) {
						let list = [2, 5, 10],
							list2 = [];
						for (let i = 0; i < list.length; i++) {
							if (player.countMark('ybsl_ptchiling') >= list[i]) {
								list2.push('ybsl_ptchiling' + (i + 1));
							}
						}
						return list2.includes(button.link[2]);
					},
					check(button) {
						return get.value({
							name: button.link[2],
						});
					},
					backup(links, player) {
						return {
							audio: 'ybsl_ptchiling',
							name: '炽翎·火伤',
							filterCard() {
								return false;
							},
							selectCard: -1,
							filterTarget(card, player, target) {
								return target != player;
							},
							selectTarget: 1,
							delay: false,
							card: links[0],

							content: lib.skill.ybsl_ptchiling_1.contentx,

							ai: {
								order: 1,
								expose: 1,
								fireAttack: true,
								result: {
									player(player, target) {
										return get.damageEffect(target, player, player, 'fire');
									},
									target(player, target) {
										return get.damageEffect(target, player, target, 'fire');
									},
								},
							},
						};
					},
				},

				contentx() {
					let card = lib.skill.ybsl_ptchiling_1_backup.card;
					let num = card[2].slice(-1);
					num -= 0;
					player.removeMark('ybsl_ptchiling', card[1]);
					target.damage(num, 'fire');
				},
				ai: {
					order: 1,
					expose: 1,
					fireAttack: true,
					result: {
						player(player, target) {
							return 1;
						},
					},
				},
			},
			2: {
				name: '炽翎·点燃',
				audio: 'ybsl_ptchiling',
				usable: 1,
				enable: 'phaseUse',
				filter(event, player) {
					return player.countMark('ybsl_ptchiling') >= 20;
				},
				prompt(event, player) {
					if (!player) {
						const player = _status.event.player;
					}
					let num = player.countMark('ybsl_ptchiling');
					return `当前拥有<span style=\'color: #99fffd\'>${num}</span>枚火焰,是否消耗<span style=\'color: #ff7b00\'>20</span>枚火焰,点燃弃牌堆？`;
				},
				content() {
					player.removeMark('ybsl_ptchiling', 20);
					game.log("<span style='color: #ff7b00'>弃牌堆燃起来了!!!</span>");
					game.YB_fire(ui.discardPile.childNodes);
				},
				ai: {
					result: {
						player(player, target) {
							let list = ui.discardPile.childNodes,
								list2 = ui.cardPile.childNodes;
							if (get.YB_noflames(list) > player.countMark('ybsl_ptchiling')) {
								return 20;
							}
							if (get.YB_noflames(list) > ui.cardPile.childNodes.length) {
								return 20;
							}
							return -1;
						},
					},
					order: 6,
				},
			},
			3: {
				name: '炽翎·毕方',
				audio: 'ybsl_ptchiling',
				usable: 1,
				enable: 'phaseUse',
				filter(event, player) {
					return player.countMark('ybsl_ptchiling') >= 40;
				},
				selectTarget: -1,
				filterTarget: true,
				prompt(event, player) {
					if (!player) {
						const player = _status.event.player;
					}
					let num = player.countMark('ybsl_ptchiling');
					return `当前拥有<span style=\'color: #99fffd\'>${num}</span>枚火焰,是否消耗<span style=\'color: #ff7b00\'>40</span>枚火焰,毁天灭地？<br>出牌阶段限一次,你可以移除40枚火焰,然后令场上角色依次展示手牌,然后弃置其中的附着火焰的牌并受到等量火属性伤害.`;
				},
				contentBefore() {
					player.removeMark('ybsl_ptchiling', 40);
				},
				content() {
					'step 0';
					if (!target.countCards('h')) {
						event.finish();
					} else {
						target.showCards(target.getCards('h'));
						event.cards = get.YB_flames(target.getCards('h'));
					}
					('step 1');
					if (!event.cards || !event.cards.length) {
						event.finish();
					} else {
						target.discard(event.cards);
						target.damage(event.cards.length, 'fire');
					}
				},
				ai: {
					result: {
						player(player, target) {
							if (get.YB_flames(player.getCards('h')) < player.hp) {
								const targets1 = game.filterPlayer(function (target) {
									return get.attitude(player, target) > 0;
								});
								const targets2 = game.filterPlayer(function (target) {
									return get.attitude(player, target) <= 0;
								});

								if (targets1.length) {
									for (const i of targets1) {
										let num = get.YB_flames(target.getCards('h'));
										if (num > i.hp) {
											return false;
										}
									}
								}
								if (targets2.length) {
									for (const i of targets1) {
										let num = get.YB_flames(target.getCards('h'));
										if (num > i.hp) {
											return true;
										}
									}
								}
							}
							return -1;
						},
					},
					fireAttack: true,
					order: 6,
				},
			},
		},
	},
	ybsl_ptqiwu: {
		audio: 'ext:夜白神略/audio/character:2',
		group: ['ybsl_ptqiwu_use', 'ybsl_ptqiwu_eat', 'ybsl_ptqiwu_1', 'ybsl_ptqiwu_2', 'ybsl_ptqiwu_3'],
		ai: { combo: 'ybsl_ptchiling' },
		derivation: 'ybsl_ptqiwu_eat',
		subSkill: {
			use: {
				name: '栖梧·吸收',
				audio: 'ybsl_ptqiwu',
				enable: 'phaseUse',
				filter(event, player) {
					return get.YB_flames(player.getCards('h')).length && get.YB_flames(player.getCards('h')).length;
				},
				discard: false,
				lose: false,
				selectCard: [1, Infinity],
				filterCard(card, player) {
					return get.YB_flames(player.getCards('h')).includes(card);
				},
				content() {
					player.showCards(cards);
					player.YB_nofire(cards);
				},
				check(card) {
					return true;
				},
				ai: {
					order: 1000,
					result: {
						player: 10,
					},
				},
			},
			eat: {
				audio: 'ybsl_ptqiwu',
				trigger: {
					player: 'damageBegin4',
				},
				filter(event, player) {
					return event.hasNature('fire');
				},
				forced: true,
				check() {
					return true;
				},
				content() {
					player.addMark('ybsl_ptchiling', trigger.num * 2);
				},
			},
			1: {
				name: '栖梧·吃桃',
				audio: 'ybsl_ptqiwu',
				usable: 1,

				enable: 'chooseToUse',
				filter(event, player) {
					const filter = event.filterCard;
					if (filter({ name: 'tao' }, player, event) && player.countMark('ybsl_ptchiling') >= 2) {
						return true;
					}
				},
				chooseButton: {
					dialog(event, player) {
						let list = [];
						for (let i = 1; i < 4; i++) {
							list.push(['消耗', get.YB_fire_num(i), 'ybsl_ptqiwu' + i]);
						}
						return ui.create.dialog('栖梧', [list, 'vcard']);
					},
					filter(button, player) {
						let list = [2, 5, 10],
							list2 = [];
						for (let i = 0; i < list.length; i++) {
							if (player.countMark('ybsl_ptchiling') >= list[i]) {
								list2.push('ybsl_ptqiwu' + (i + 1));
							}
						}
						return list2.includes(button.link[2]);
					},
					check(button) {
						return get.value({
							name: button.link[2],
						});
					},
					backup(links, player) {
						return {
							audio: 'ybsl_ptqiwu',
							name: '栖梧·吃桃',
							filterCard() {
								return false;
							},
							selectCard: -1,

							delay: false,
							lose: false,
							discard: false,
							cardx: links[0],
							viewAs() {
								let card = links[0];
								return {
									name: 'tao',
									YB_baseDamage: card[2],
								};
							},
							precontent() {
								event.result.cards = [];
							},

							ai: {
								order: 1,
								save: true,
								recover: 1,
								effect: {
									player(player, target) {
										return get.effect(target, { name: 'tao' }, player, player);
									},
									target(player, target) {
										return get.effect(target, { name: 'tao' }, player, target);
									},
								},
							},
							prompt(links, player) {
								let num = links[0][2].slice(-1);
								num -= 0;
								return `消耗${links[0][1]}枚火焰,对一名角色使用数值为${num}的桃`;
							},
						};
					},
				},
				ai: {
					order: 1,
					recover: 1,
					save: true,
					result: {
						player(player, target) {
							return 1;
						},
					},
				},
				hiddenCard(player, name) {
					return player.countMark('ybsl_ptqiwu') >= 2 && name == 'tao';
				},
			},
			2: {
				forced: true,
				charlotte: true,
				firstDo: true,
				trigger: {
					player: 'useCardBefore',
				},
				filter(event, player) {
					return event.card && event.card.YB_baseDamage;
				},
				content() {
					let num = trigger.card.YB_baseDamage.slice(-1);
					num -= 0;

					player.removeMark('ybsl_ptchiling', get.YB_fire_num(num));
					trigger.baseDamage = num;
				},
			},
			3: {
				name: '栖梧·重明',
				audio: 'ybsl_ptqiwu',
				round: 1,
				enable: 'chooseToUse',
				filter(event, player) {
					if (player.countMark('ybsl_ptchiling') < 40) {
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
					player.removeMark('ybsl_ptchiling', 40);
					('step 1');
					player.hp = player.maxHp;
					player.draw(3);
				},
				ai: {
					order: 10,
					skillTagFilter(player, arg, target) {
						if (player != target) {
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
				},
			},
		},
	},

	hairi_shangshi: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['loseAfter', 'changeHp', 'gainMaxHpAfter', 'loseMaxHpAfter'],
			global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},

		forced: true,
		filter(event, player) {
			if (event.getl && !event.getl(player)) {
				return false;
			}
			return player.countCards('h') < player.getDamagedHp();
		},
		content() {
			player.draw(player.getDamagedHp() - player.countCards('h'));
		},
		ai: {
			noh: true,
			skillTagFilter(player, tag) {
				if (tag == 'noh' && player.maxHp - player.hp < player.countCards('h')) {
					return false;
				}
			},
		},
	},
	hairi_zheyi: {
		trigger: {
			global: 'phaseBefore',
			player: ['enterGame', 'showCharacterAfter'],
		},
		forced: true,
		filter(event, player, name) {
			if (get.mode() == 'guozhan') {
				return name == 'showCharacterAfter';
			}
			return name == 'enterGame' || game.phaseNumber == 0;
		},
		content() {
			if (get.mode() == 'guozhan' && !player.checkMainSkill('hairi_zheyi')) {
				return;
			} else {
				player.disableEquip('equip1');
				player.disableEquip('equip2');
				player.disableEquip('equip3');
				player.disableEquip('equip4');
				player.disableEquip('equip5');
			}
		},
	},
	hairi_zhongxia: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		dutySkill: true,
		hiddenCard(player, name) {
			if (player.hasSkill('hairi_zhongxia_block')) {
				return false;
			}
			if (get.type(name) == 'basic' && lib.inpile.includes(name) && player.countCards('h') > 0) {
				return true;
			}
		},
		filter(event, player) {
			if (event.responded || player.hasSkill('hairi_zhongxia_block') || player.countCards('h') <= 0) {
				return false;
			}
			for (const i of lib.inpile) {
				if (get.type(i) == 'basic' && event.filterCard({ name: i }, player, event)) {
					return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];
				for (const i of lib.inpile) {
					if (get.type(i) == 'basic' && event.filterCard({ name: i }, player, event)) {
						list.push(['基本', '', i]);
						if (i == 'sha') {
							for (let j of get.YB_natureList()) {
								list.push(['基本', '', 'sha', j]);
							}
						}
					}
				}
				return ui.create.dialog('终夏', [list, 'vcard'], 'hidden');
			},
			check(button) {
				if (button.link[2] == 'shan') {
					return 3;
				}
				const player = _status.event.player;
				if (button.link[2] == 'jiu') {
					if (player.getUseValue({ name: 'jiu' }) <= 0) {
						return 0;
					}
					if (player.countCards('h', 'sha')) {
						return player.getUseValue({ name: 'jiu' });
					}
				}
				return player.getUseValue({ name: button.link[2], nature: button.link[3] }) / 4;
			},
			backup(links, player) {
				return {
					selectCard: -1,
					filterCard(card, player) {
						if (player.hasSkill('hairi_zhongxia_block')) {
							return false;
						}
						if (player.countCards('h') <= 0) {
							return false;
						}
						return true;
					},
					filter(event, player) {
						if (player.hasSkill('hairi_zhongxia_block')) {
							return false;
						}
						if (player.countCards('h') <= 0) {
							return false;
						}
						return true;
					},
					complexCard: true,
					viewAs: {
						name: links[0][2],
						nature: links[0][3],
						suit: 'none',
						number: null,
					},
					position: 'h',
					ignoreMod: true,
					check(card) {
						const player = _status.event.player;
						if (player.countCards('h', { name: card.name }) > 0) {
							return false;
						}
						let cards = player.getCards('h');
						let list = [];
						for (const i of cards) {
							const suit = i.suit;
							if (list.includes(suit)) {
								return false;
							} else {
								list.push(suit);
							}
						}
						return true;
					},
					precontent() {
						'step 0';
						let cards = event.result.cards;
						player.discard(cards);

						event.result.card = {
							name: event.result.card.name,
							nature: event.result.card.nature,
						};
						event.result.cards = [];
						delete event.result.skill;
						if (cards.length) {
							const list2 = [];
							for (let i = 0; i < cards.length; i++) {
								const suit = cards[i].suit;
								if (list2.includes(suit)) {
									let evt = event.parent;
									evt.set('hairi_zhongxia', true);
									evt.goto(0);
									player.addTempSkill('hairi_zhongxia_block');
									if (cards.length == player.maxHp || cards.length == player.maxHp - player.hp) {
										player.gainMaxHp();
									}
									return;
								} else {
									list2.push(suit);
								}
							}
							if (cards.length == player.maxHp || cards.length == player.maxHp - player.hp) {
								player.gainMaxHp();
							}
						}
					},
				};
			},
			prompt(links, player) {
				let name = links[0][2];
				const nature = links[0][3];
				return '弃置所有手牌,若以此法弃置的牌花色各不相同,则视为使用' + (get.translation(nature) || '') + get.translation(name) + ',若以此法弃置的牌数等于你体力上限,你加1点体力上限';
			},
		},
		ai: {
			order(item, player) {
				if (player && _status.event.type == 'phase') {
					let num = player.countCards('h');
					return Math.max(6 - num, 1);
				}
				return 1;
			},
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
		group: ['hairi_zhongxia_achieve', 'hairi_zhongxia_fail'],
		subSkill: {
			achieve: {
				trigger: {
					player: ['phaseZhunbeiBegin'],
				},
				forced: true,
				filter(event, player) {
					if (player.maxHp >= 5) {
						return true;
					}
					return false;
				},
				content() {
					'step 0';
					game.log(player, '成功完成使命');
					let list = ['获得炒饭', '重新度过夏日'];
					player.chooseControl(list).set('prompt', '将这个夏日装进口袋？');
					('step 1');
					if (result.control == '获得炒饭') {
						player.awakenSkill('hairi_zhongxia');
						player.addSkill('umi_chaofan');
						player.enableEquip('equip1');
						player.enableEquip('equip2');
						player.enableEquip('equip3');
						player.enableEquip('equip4');
						player.enableEquip('equip5');
					} else {
						let num = player.maxHp - 1;
						player.loseMaxHp(num);
					}
				},
			},
			fail: {
				trigger: { player: 'die' },
				forced: true,
				forceDie: true,
				filter(event, player) {
					return true;
				},
				content() {
					'step 0';
					game.log(player, '使命失败');
					player.chooseTarget(true, get.prompt('hairi_zhongxia'), '令一名其他角色获得<终夏>', lib.filter.notMe);
					('step 1');
					if (result.bool) {
						let target = result.targets[0];
						target.addSkill('hairi_zhongxia');
					}
				},
			},
			block: {
				mark: true,
			},
		},
	},

	kamome_ybyangfan: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['loseAfter', 'enterGame'],
			global: ['equipAfter', 'addJudgeAfter', 'phaseBefore', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		derivation: 'kamome_suitcase',
		forced: true,
		filter(event, player, name) {
			if (typeof event.getl != 'function') {
				return event.name != 'phase' || game.phaseNumber == 0;
			}
			let evt = event.getl(player);
			let list = [];
			event.kamome_ybyangfan_sun_suit = false;
			if (evt && evt.hs && evt.hs.length) {
				if (event.name == 'lose') {
					for (let i in event.gaintag_map) {
						if (event.gaintag_map[i].includes('kamome_ybyangfan_ying') || event.gaintag_map[i].includes('kamome_ybyangfan_yan') || event.gaintag_map[i].includes('kamome_ybyangfan_sun') || event.gaintag_map[i].includes('kamome_ybyangfan_que')) {
							if (event.gaintag_map[i].includes('kamome_ybyangfan_sun')) {
								event.cards.forEach((c) => {
									if ((c.cardid = i)) {
										event.kamome_ybyangfan_sun_suit = c.suit;
									}
								});
							}
							return true;
						}
					}
				}
				if (
					player.hasHistory('lose', (evt) => {
						if (event != evt.parent) {
							return false;
						}
						for (let i in evt.gaintag_map) {
							if (evt.gaintag_map[i].includes('kamome_ybyangfan_ying') || evt.gaintag_map[i].includes('kamome_ybyangfan_yan') || evt.gaintag_map[i].includes('kamome_ybyangfan_sun') || evt.gaintag_map[i].includes('kamome_ybyangfan_que')) {
								if (evt.gaintag_map[i].includes('kamome_ybyangfan_ying')) {
									list.push('kamome_ybyangfan_ying');
								}
								if (evt.gaintag_map[i].includes('kamome_ybyangfan_yan')) {
									list.push('kamome_ybyangfan_yan');
								}
								if (evt.gaintag_map[i].includes('kamome_ybyangfan_sun')) {
									list.push('kamome_ybyangfan_sun');
									evt.cards.forEach((c) => {
										if ((c.cardid = i)) {
											event.kamome_ybyangfan_sun_suit = c.suit;
										}
									});
								}
								if (evt.gaintag_map[i].includes('kamome_ybyangfan_que')) {
									list.push('kamome_ybyangfan_que');
								}
							}
						}
						if (list && list.length) {
							event.kamome_ybyangfan = list;

							return true;
						}
					})
				) {
					return true;
				}
			}
			if (evt && evt.player == player && evt.es && evt.es.length) {
				return true;
			}
		},
		async content(event, trigger, player) {
			if (trigger.cards && trigger.name == 'lose') {
				for (let i in trigger.gaintag_map) {
					if (trigger.gaintag_map[i].includes('kamome_ybyangfan_ying')) {
						game.log(player, '发动了', '#y鹰·观星');
						await player.chooseToGuanxing(2).set('prompt', '鹰:点击或拖动将牌移动到牌堆顶或牌堆底');
					} else if (trigger.gaintag_map[i].includes('kamome_ybyangfan_yan')) {
						game.log(player, '发动了', '#y燕·伤害');
						if (game.filterPlayer((current) => current != player && current.isIn()).length) {
							let next = game.createEvent('kamome_ybyangfan_yan', false);
							next.player = player;
							next.setContent(async function (event, trigger, player) {
								let result = await player
									.chooseTarget(true, 1, '燕:对一名其他角色造成1点伤害')
									.set('filterTarget', function (card, player, target) {
										return target != player && target.isIn();
									})
									.set('ai', function (target) {
										return get.damageEffect(player, target, _status.event.player);
									})
									.forResult();
								if (result.bool) {
									await result.targets[0].damage(player);
								}
							});
							await next;
						}
					} else if (trigger.gaintag_map[i].includes('kamome_ybyangfan_sun')) {
						game.log(player, '发动了', '#y隼·捡牌');
						const suitx = trigger.kamome_ybyangfan_sun_suit;
						if (suitx && ui.discardPile.childNodes.length && Array.from(ui.discardPile.childNodes).filter((c) => get.type2(c) == 'trick' && c.suit == suitx) && Array.from(ui.discardPile.childNodes).filter((c) => get.type2(c) == 'trick' && c.suit == suitx).length) {
							let next = game.createEvent('kamome_ybyangfan_sun', false);
							next.player = player;
							next.suitx = suitx;
							next.setContent(async function (event, trigger, player) {
								const cardsx = Array.from(ui.discardPile.childNodes).filter((c) => get.type2(c) == 'trick' && c.suit == event.suitx);
								const resultx = await player
									.chooseCardButton(cardsx, '隼:选择一张牌获得之', 1, true)
									.set('ai', function (button) {
										return get.value(button.link);
									})
									.forResult();
								if (resultx.bool) {
									await player.gain(resultx.links[0]);
								}
							});
							await next;
						}
					} else if (trigger.gaintag_map[i].includes('kamome_ybyangfan_que')) {
						game.log(player, '发动了', '#y雀·回复');
						await player.recover();
					}
				}
			}
			if (trigger.kamome_ybyangfan) {
				const listxxx = trigger.kamome_ybyangfan;
				if (listxxx.includes('kamome_ybyangfan_ying')) {
					game.log(player, '发动了', '#y鹰·观星');
					await player.chooseToGuanxing(2).set('prompt', '鹰:点击或拖动将牌移动到牌堆顶或牌堆底');
				} else if (listxxx.includes('kamome_ybyangfan_yan')) {
					game.log(player, '发动了', '#y燕·伤害');
					if (game.filterPlayer((current) => current != player && current.isIn()).length) {
						let next = game.createEvent('kamome_ybyangfan_yan', false);
						next.player = player;
						next.setContent(async function (event, trigger, player) {
							let result = await player
								.chooseTarget(true, 1, '燕:对一名其他角色造成1点伤害')
								.set('filterTarget', function (card, player, target) {
									return target != player && target.isIn();
								})
								.set('ai', function (target) {
									return get.damageEffect(player, target, _status.event.player);
								})
								.forResult();
							if (result.bool) {
								await result.targets[0].damage(player);
							}
						});
						await next;
					}
				} else if (listxxx.includes('kamome_ybyangfan_sun')) {
					game.log(player, '发动了', '#y隼·捡牌');
					const suitx = trigger.kamome_ybyangfan_sun_suit;
					if (suitx && ui.discardPile.childNodes.length && Array.from(ui.discardPile.childNodes).filter((c) => get.type2(c) == 'trick' && c.suit == suitx) && Array.from(ui.discardPile.childNodes).filter((c) => get.type2(c) == 'trick' && c.suit == suitx).length) {
						let next = game.createEvent('kamome_ybyangfan_sun', false);
						next.player = player;
						next.suitx = suitx;
						next.setContent(async function (event, trigger, player) {
							const cardsx = Array.from(ui.discardPile.childNodes).filter((c) => get.type2(c) == 'trick' && c.suit == event.suitx);
							const resultx = await player
								.chooseCardButton(cardsx, '隼:选择一张牌获得之', 1, true)
								.set('ai', function (button) {
									return get.value(button.link);
								})
								.forResult();
							if (resultx.bool) {
								await player.gain(resultx.links[0]);
							}
						});
						await next;
					}
				} else if (listxxx.includes('kamome_ybyangfan_que')) {
					game.log(player, '发动了', '#y雀·回复');
					await player.recover();
				}
			}
			if (trigger.getl && trigger.getl(player).es && trigger.getl(player).es.length) {
				game.log(player, '发动了', '#y鸥·召集');
				let num = player.getCards('h').filter((c) => get.kamome_ybyangfan(c)).length;
				if (4 - num > 0) {
					let next = game.createEvent('kamome_ybyangfan', false);
					next.player = player;
					next.num = 4 - num;
					next.setContent(function () {
						'step 0';
						const nextx = player.gain(get.cards(event.num), 'draw');
						nextx._triggered = null;
						nextx;
						event.cardsx = nextx.cards;
						('step 1');
						player.kamome_ybyangfan(event.cardsx);
					});
					await next;
				}
			}
			if ((trigger.name == 'phase' && game.phaseNumber == 0) || trigger.name == 'enterGame') {
				await player.equip(game.createCard2('kamome_suitcase', 'spade', 1));
				player.kamome_ybyangfan();
			}
		},
		init(player) {
			player.kamome_ybyangfan();
		},
		ai: {
			noe: true,
			reverseEquip: true,
			effect: {
				target(card, player, target, current) {
					if (get.type(card) == 'equip' && !get.cardtag(card, 'gifts')) {
						return [1, 3];
					}
				},
			},
		},
	},
	kamome_ybyangfan_ying: {},
	kamome_ybyangfan_yan: {},
	kamome_ybyangfan_sun: {},
	kamome_ybyangfan_que: {},
	kamome_huanmeng_ybsl_kamome: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	kamome_jieban_ybsl_kamome: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	youta_fengshen: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseBefore',
			player: 'enterGame',
		},
		forced: true,
		filter(event, player) {
			if (player.name2 != undefined) {
				return false;
			}
			let list = ['db_key_hina', 'yb_key_hina'];
			if (
				game.filterPlayer((c) => {
					return list.includes(c.name) || list.includes(c.name1) || list.includes(c.name2);
				}).length
			) {
				return false;
			}
			return event.name != 'phase' || game.phaseNumber == 0;
		},
		content() {
			'step 0';
			player.loseMaxHp();
			('step 1');
			let name = lib.character.yb_key_hina ? 'yb_key_hina' : 'db_key_hina';
			player.changeCharacter([player.name, name]);
		},
	},
	youta_yingshen: {
		ai: {
			canZhuzhan: true,
		},
		group: ['youta_yingshen_zhuzhan', 'youta_yingshen_discard', 'youta_yingshen_exchange'],
		subSkill: {
			zhuzhan: {
				trigger: { player: 'yingbianZhuzhanBegin' },
				forced: true,
				popup: false,
				firstDo: true,
				content() {
					trigger.setContent(get.info('youta_yingshen').yingbian);
				},
			},
			discard: {},
			exchange: {
				trigger: { player: ['useSkill', 'logSkillBegin'] },

				filter(event, player) {
					return event.skill == 'youta_yingshen' && !player.storage.youta_huanshen;
				},
				forced: true,
				popup: false,
				content() {
					player.YB_exchange();
				},
			},
		},
		yingbian() {
			'step 0';
			event._global_waiting = true;
			event.send = (player, card, source, targets, id, id2, yingbianZhuzhanAI, skillState) => {
				if (skillState) {
					player.applySkills(skillState);
				}
				let type = get.type2(card),
					str = get.translation(source);
				if (targets && targets.length) {
					str += `对${get.translation(targets)}`;
				}
				str += `使用了${get.translation(card)},是否弃置一张${get.translation(type)}为其助战？`;
				player.chooseCard({
					filterCard: (card, player) => get.type2(card) == type && lib.filter.cardDiscardable(card, player),
					prompt: str,
					position: 'h',
					_global_waiting: true,
					id: id,
					id2: id2,
					ai:
						typeof yingbianZhuzhanAI == 'function'
							? yingbianZhuzhanAI(player, card, source, targets)
							: (cardx) => {
								const info = get.info(card);
								if (info && info.ai && info.ai.yingbian) {
									const ai = info.ai.yingbian(card, source, targets, player);
									if (!ai) {
										return 0;
									}
									return ai - get.value(cardx);
								} else if (get.attitude(player, source) <= 0) {
									return 0;
								}
								return 5 - get.value(cardx);
							},
				});
				if (!game.online) {
					return;
				}
				_status.event._resultid = id;
				game.resume();
			};
			('step 1');
			let type = get.type2(card);
			event.list = game.filterPlayer((current) => (current.countCards('h') && (_status.connectMode || current.hasCard((cardx) => get.type2(cardx) == type, 'h'))) || current.hasSkillTag('canZhuzhan', true)).sortBySeat(_status.currentPhase || player);
			event.id = get.id();
			('step 2');
			if (!event.list.length) {
				event.finish();
			} else if (_status.connectMode && (event.list[0].isOnline() || event.list[0] == game.me)) {
				event.goto(4);
			} else {
				event.send((event.current = event.list.shift()), event.card, player, trigger.targets, event.id, trigger.parent.id, trigger.yingbianZhuzhanAI);
			}
			('step 3');
			if (result.bool) {
				event.zhuzhanresult = event.current;
				event.zhuzhanresult2 = result;
				if (event.current != game.me) {
				}
				event.goto(8);
			} else {
				event.goto(2);
			}
			('step 4');
			let id = event.id,
				sendback = (result, player) => {
					if (result && result.id == id && !event.zhuzhanresult && result.bool) {
						event.zhuzhanresult = player;
						event.zhuzhanresult2 = result;
						game.broadcast('cancel', id);
						if (_status.event.id == id && _status.event.name == 'chooseCard' && _status.paused) {
							return () => {
								event.resultOL = _status.event.resultOL;
								ui.click.cancel();
								if (ui.confirm) {
									ui.confirm.close();
								}
							};
						}
					} else if (_status.event.id == id && _status.event.name == 'chooseCard' && _status.paused) {
						return () => (event.resultOL = _status.event.resultOL);
					}
				},
				withme = false,
				withol = false,
				list = event.list;
			for (let i = 0; i < list.length; i++) {
				const current = list[i];
				if (current.isOnline()) {
					withol = true;
					current.wait(sendback);
					current.send(event.send, current, event.card, player, trigger.targets, event.id, trigger.parent.id, trigger.yingbianZhuzhanAI, get.skillState(current));
					list.splice(i--, 1);
				} else if (current == game.me) {
					withme = true;
					event.send(current, event.card, player, trigger.targets, event.id, trigger.parent.id, trigger.yingbianZhuzhanAI);
					list.splice(i--, 1);
				}
			}
			if (!withme) {
				event.goto(6);
			}
			if (_status.connectMode && (withme || withol)) {
				game.players.forEach((value) => {
					if (value != player) {
						value.showTimer();
					}
				});
			}
			event.withol = withol;
			('step 5');
			if (!result || !result.bool || event.zhuzhanresult) {
				return;
			}
			game.broadcast('cancel', event.id);
			event.zhuzhanresult = game.me;
			event.zhuzhanresult2 = result;
			('step 6');
			if (event.withol && !event.resultOL) {
				game.pause();
			}
			('step 7');
			game.players.forEach((value) => value.hideTimer());
			('step 8');
			if (event.zhuzhanresult) {
				let target = event.zhuzhanresult;
				if (target == player && player.hasSkill('youta_yingshen')) {
				}
				target.line(player, 'green');
				target.discard(event.zhuzhanresult2.cards).discarder = target;
				if (typeof event.afterYingbianZhuzhan == 'function') {
					event.afterYingbianZhuzhan(event, trigger);
				}
				const yingbianCondition = event.name.slice(8).toLowerCase(),
					yingbianConditionTag = `yingbian_${yingbianCondition}_tag`;
				target.popup(yingbianConditionTag, lib.yingbian.condition.color.get(yingbianCondition));
				game.log(target, '响应了', '<span class="bluetext">' + (target == player ? '自己' : get.translation(player)) + '</span>', '发起的', yingbianConditionTag);
				target.addExpose(0.2);
				event.result = {
					bool: true,
				};
			} else {
				event.result = {
					bool: false,
				};
			}
		},
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseCard',
		filter(event, player) {
			return event.parent.name == 'yingbianZhuzhan';
		},
	},
	youta_huanshen: {
		audio: 'ext:夜白神略/audio/character:2',
		groupSkill: 'shen',
		limited: true,
		trigger: { global: 'dying' },
		mark: true,
		filter(event, player) {
			if (player.group != 'shen') {
				return false;
			}
			if (player.storage.youta_huanshen) {
				return false;
			}
			if (_status.currentPhase == event.player) {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			player.awakenSkill('youta_huanshen');
			player.storage.youta_huanshen = true;
			('step 1');
			if (player != trigger.player) {
				player.line(trigger.player, 'key');
			}
			('step 2');
			player.YB_exchange();
			('step 3');
			trigger.player.recover(1 - trigger.player.hp);
		},
		ai: {
			save: true,
		},
	},

	ybsl_shidao: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseUseBefore',
		},
		filter(event, player) {
			if (_status.currentPhase == player) {
				return false;
			}
			return player.countCards('he') > 0;
		},
		cost() {
			event.result = player
				.choosePlayerCard(player, 'he')
				.set('prompt2', '是否展示一张牌警示' + get.translation(trigger.player) + '？')
				.set('ai', function (card) {
					const player = player || _status.event.player;
					let att = get.attitude(player, trigger.player);
					if (att > 0) {
						if (get.type(card) == 'equip') {
							return 3;
						}
						return 2;
					}
					return false;
				})
				.forResult();
		},
		async content(event, trigger, player) {
			let cards = event.cards;
			await player.showCards(cards);
			const relu = await player
				.chooseControl()
				.set('choiceList', ['其本阶段使用此颜色牌无次数限制', '其本阶段可以将此颜色牌当【杀】使用且不可被闪避'])
				.set('prompt', '示刀:清选择一项')
				.set('ai', function () {
					return 0;
				})
				.forResult();
			if (relu.index == 0) {
				await trigger.player.addTempSkill('ybsl_shidao_paoxiao');
				if (!player.storage.ybsl_shidao_paoxiao) {
					player.storage.ybsl_shidao_paoxiao = [];
				}
				trigger.player.storage.ybsl_shidao_paoxiao.push(get.color(cards[0]));
			} else {
				await trigger.player.addTempSkill('ybsl_shidao_wusheng');
				if (!player.storage.ybsl_shidao_wusheng) {
					player.storage.ybsl_shidao_wusheng = [];
				}
				trigger.player.storage.ybsl_shidao_wusheng.push(get.color(cards[0]));
			}
			if (get.type(cards[0]) == 'equip') {
				await trigger.player.addTempSkill(lib.card[cards[0].name].skills, { player: 'phaseUseAfter' });
			}
		},
		subSkill: {
			wusheng: {
				forced: true,
				init(player) {
					if (!player.storage.ybsl_shidao_wusheng) {
						player.storage.ybsl_shidao_wusheng = [];
					}
				},
				enable: 'chooseToUse',
				filterCard(card, player) {
					const color = get.color(card);
					return player.getStorage('ybsl_shidao_wusheng').includes(color);
				},
				position: 'hes',
				viewAs: {
					name: 'sha',
					storage: {
						ybsl_shidao: true,
					},
				},
				filter(event, player, name) {
					if (name && name == 'shaBegin') {
						return event.card && event.card.name == 'sha' && event.card?.storage?.ybsl_shidao == true;
					}
					return player.getStorage('ybsl_shidao_wusheng');
				},
				viewAsFilter(player) {
					if (
						!player.countCards('hes', function (card) {
							const color = get.color(card);
							return player.getStorage('ybsl_shidao_wusheng').includes(color);
						})
					) {
						return false;
					}
				},
				prompt: '将一张示刀指示的牌当杀使用',
				check(card) {
					let val = get.value(card);
					return 5 - val;
				},
				trigger: { player: 'shaBegin' },
				content() {
					if (trigger && event.triggername && event.triggername == 'shaBegin') {
						trigger.directHit = true;
					}
				},
				ai: {
					respondSha: true,
					skillTagFilter(player) {
						if (!player.countCards('he')) {
							return false;
						}
						let cards = player.getCards('he');
						for (let card of cards) {
							const color = get.color(card);
							if (player.getStorage('ybsl_shidao_wusheng').includes(color)) {
								return true;
							}
						}
					},
				},
			},
			paoxiao: {
				forced: true,
				init(player) {
					if (!player.storage.ybsl_shidao_paoxiao) {
						player.storage.ybsl_shidao_paoxiao = [];
					}
				},
				mod: {
					cardUsable(card, player) {
						const color = get.color(card);
						if (color == 'unsure' || player.getStorage('ybsl_shidao_paoxiao').includes(color)) {
							return Infinity;
						}
					},
				},
			},
		},
		ai: {
			expose: 1,
		},
	},
	ybsl_reshidao: {
		inherit: 'ybsl_shidao',
		filter(event, player) {
			return player.countCards('he') > 0;
		},
	},
	ybsl_duhun: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { global: 'die' },
		filter(event, player) {
			return event.player != player;
		},

		forceDie: true,
		content() {
			'step 0';
			trigger.player
				.chooseTarget(get.prompt2('ybsl_duhun'), function (card, player, target) {
					return trigger.player != target && _status.event.sourcex != target;
				})
				.set('forceDie', true)
				.set('ai', function (target) {
					let num = get.attitude(_status.event.player, target);
					if (num > 0) {
						if (target.hp == 1) {
							num += 2;
						}
						if (target.hp < target.maxHp) {
							num += 2;
						}
					}
					return num;
				})
				.set('sourcex', trigger.source);
			('step 1');
			if (result.bool) {
				let target = result.targets[0];
				trigger.player.line(target, 'green');
				target.recover();
				target.draw(3);
			}
		},
	},

	kagari_ybzongsi: {
		enable: 'phaseUse',
		usable: 1,
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
			let next = player.chooseControl();
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
			const controls = ['将这张牌移动到牌堆的顶部或者底部', '将这张牌移动到弃牌堆的顶部或者底部', '将这张牌移动到一名角色对应的区域里'];
			event.controls = controls;
			let next = player.chooseControl();
			next.set('prompt', '要对' + get.translation(event.card) + '做什么呢？');
			next.set('choiceList', controls);
			next.ai = function () {
				return 2;
			};
			('step 4');
			result.control = event.controls[result.index];
			let list = ['弃牌堆', '牌堆', '角色'];
			for (let i = 0; i < list.length; i++) {
				if (result.control.includes(list[i])) {
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
				let list = ['手牌区'];

				list.push('装备区');
				if (!event.target2.isDisabledJudge()) {
					list.push('判定区');
				}
				if (list.length == 1) {
					event._result = { control: list[0] };
				} else {
					player.chooseControl(list).set('prompt', '把' + get.translation(card) + '移动到' + get.translation(event.target2) + '的...').ai = function () {
						return 0;
					};
				}
			}
			('step 6');
			if (event.index2 != 2) {
				const node = ui[event.index == 0 ? 'discardPile' : 'cardPile'];
				if (event.target1) {
					let next = event.target1.lose(card, event.position);
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
				game.updateRoundNumber();
				event.finish();
			} else {
				if (result.control == '手牌区') {
					let next = event.target2.gain(card);
					if (event.target1) {
						next.source = event.target1;
						next.animate = 'giveAuto';
					} else {
						next.animate = 'draw';
					}
					event.goto(8);
				} else if (result.control == '装备区') {
					event.goto(12);
				} else {
					event.goto(10);
				}
			}
			('step 7');
			game.updateRoundNumber();
			event.finish();
			('step 8');

			const list55 = [];
			for (const yb of lib.inpile) {
				if (yb == 'sha') {
					list55.add([get.type2(yb), '', 'sha']);
					const listxx = get.YB_natureList();
					for (const zzz of listxx) {
						list55.add([get.type2(yb), '', 'sha', zzz]);
					}
				} else {
					list55.add([get.type2(yb), '', yb]);
				}
			}
			player
				.chooseButton(['纵丝', '令' + ('<span class=yellowtext>' + get.translation(card) + '</span>') + '视为什(shén)么？<br>(知道有多音字,所以特意标上了读音[机智])', [list55, 'vcard']])
				.set('prompt2', '将此牌转化为什(shén)么？<br>(知道有多音字,所以特意标上了读音[机智])')
				.set('ai', function (button) {
					let player = _status.event.player,
						name = button.link[2];
					return player.getUseValue({ name: name });
				});
			event.goto(9);
			('step 9');
			if (result.links) {
				let name = result.links[0][2];
				const nature = result.links[0][3];

				game.broadcastAll(
					function (card, name, nature) {
						card.addGaintag('_kagari_ybzongsi_card');
						_status.kagari_ybzongsi[card.cardid] = name;
						_status.kagari_ybzongsi_nature[card.cardid] = nature;
					},
					card,
					name,
					nature,
				);
			}
			game.updateRoundNumber();
			event.finish();
			('step 10');
			const list66 = [];
			for (const yb of lib.inpile) {
				if (lib.card[yb].type == 'delay') {
					list66.add([get.type2(yb), '', yb]);
				}
				if (lib.card[yb].type == 'special_delay') {
					list66.add([get.type2(yb), '', yb]);
				}
			}
			player.chooseButton(['纵丝', '令' + ('<span class=yellowtext>' + get.translation(card) + '</span>') + '视为什(shén)么？选择原牌名则不会转化<br>(知道有多音字,所以特意标上了读音[机智])', [list66, 'vcard']]).set('prompt2', '将此牌转化为什(shén)么？选择原牌名则不会转化,取消则蓄谋<br>(知道有多音字,所以特意标上了读音[机智])');
			('step 11');
			if (event.target1) {
				event.target1.line(event.target2, 'water');
			}
			if (!result.links) {
				event.target2.addJudge({ name: 'xumou_jsrg' }, [card]);
			} else if (result.links[0][2] == card.name) {
				event.target2.addJudge(card);
			} else {
				event.target2.addJudge({ name: result.links[0][2] }, [card]);
			}
			game.updateRoundNumber();
			event.finish();
			('step 12');
			const list66 = [];
			for (const yb of lib.inpile) {
				if (lib.card[yb].type == 'equip') {
					list66.add([get.type2(yb), '', yb]);
				}
			}
			player.chooseButton(['纵丝', '令' + ('<span class=yellowtext>' + get.translation(card) + '</span>') + '视为什(shén)么？选择原牌名则不会转化<br>(知道有多音字,所以特意标上了读音[机智])', [list66, 'vcard']]).set('prompt2', '将此牌转化为什(shén)么？选择原牌名则不会转化,取消则蓄谋<br>(知道有多音字,所以特意标上了读音[机智])');
			('step 13');
			if (event.target1) {
				event.target1.$give(card, event.target2);
			}

			if (!result.links) {
				event.target2.equip(card);
			} else if (result.links[0][2] == card.name) {
				event.target2.equip(card);
			} else {
				event.target2.equip({ name: result.links[0][2] }, [card]);
			}

			game.updateRoundNumber();
			event.finish();
		},
		ai: {
			order: 10,
			result: { player: 1 },
		},
	},

	kagari_ybzongsix: {
		enable: 'phaseUse',
		usable: 1,
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
			let next = player.chooseControl();
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
			const controls = ['将这张牌移动到牌堆的顶部或者底部', '将这张牌移动到弃牌堆的顶部或者底部', '将这张牌移动到一名角色对应的区域里'];
			event.controls = controls;
			let next = player.chooseControl();
			next.set('prompt', '要对' + get.translation(event.card) + '做什么呢？');
			next.set('choiceList', controls);
			next.ai = function () {
				return 2;
			};
			('step 4');
			result.control = event.controls[result.index];
			let list = ['弃牌堆', '牌堆', '角色'];
			for (let i = 0; i < list.length; i++) {
				if (result.control.includes(list[i])) {
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
				let list = ['手牌区'];

				list.push('装备区');
				if (!event.target2.isDisabledJudge()) {
					list.push('判定区');
				}
				if (list.length == 1) {
					event._result = { control: list[0] };
				} else {
					player.chooseControl(list).set('prompt', '把' + get.translation(card) + '移动到' + get.translation(event.target2) + '的...').ai = function () {
						return 0;
					};
				}
			}
			('step 6');
			if (event.index2 != 2) {
				const node = ui[event.index == 0 ? 'discardPile' : 'cardPile'];
				if (event.target1) {
					let next = event.target1.lose(card, event.position);
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
				game.updateRoundNumber();
				event.finish();
			} else {
				if (result.control == '手牌区') {
					let next = event.target2.gain(card);
					if (event.target1) {
						next.source = event.target1;
						next.animate = 'giveAuto';
					} else {
						next.animate = 'draw';
					}
					event.goto(8);
				} else if (result.control == '装备区') {
					event.goto(12);
				} else {
					event.goto(10);
				}
			}
			('step 7');
			game.updateRoundNumber();
			event.finish();
			('step 8');

			const list55 = [];

			for (const yb in lib.card) {
				if (yb == 'sha') {
					list55.add([get.type2(yb), '', 'sha']);
					const listxx = get.YB_natureList();
					for (const zzz of listxx) {
						list55.add([get.type2(yb), '', 'sha', zzz]);
					}
				} else {
					list55.add([get.type2(yb), '', yb]);
				}
			}
			player
				.chooseButton(['纵丝', '令' + ('<span class=yellowtext>' + get.translation(card) + '</span>') + '视为什(shén)么？<br>(知道有多音字,所以特意标上了读音[机智])', [list55, 'vcard']])
				.set('prompt2', '将此牌转化为什(shén)么？<br>(知道有多音字,所以特意标上了读音[机智])')
				.set('ai', function (button) {
					let player = _status.event.player,
						name = button.link[2];
					return player.getUseValue({ name: name });
				});
			event.goto(9);
			('step 9');
			if (result.links) {
				let name = result.links[0][2];
				const nature = result.links[0][3];

				game.broadcastAll(
					function (card, name, nature) {
						card.addGaintag('_kagari_ybzongsi_card');
						_status.kagari_ybzongsi[card.cardid] = name;
						_status.kagari_ybzongsi_nature[card.cardid] = nature;
					},
					card,
					name,
					nature,
				);
			}
			game.updateRoundNumber();
			event.finish();
			('step 10');
			const list66 = [];

			for (const yb in lib.card) {
				if (lib.card[yb].type == 'delay') {
					list66.add([get.type2(yb), '', yb]);
				}
				if (lib.card[yb].type == 'special_delay') {
					list66.add([get.type2(yb), '', yb]);
				}
			}
			player.chooseButton(['纵丝', '令' + ('<span class=yellowtext>' + get.translation(card) + '</span>') + '视为什(shén)么？选择原牌名则不会转化<br>(知道有多音字,所以特意标上了读音[机智])', [list66, 'vcard']]).set('prompt2', '将此牌转化为什(shén)么？选择原牌名则不会转化,取消则蓄谋<br>(知道有多音字,所以特意标上了读音[机智])');
			('step 11');
			if (event.target1) {
				event.target1.line(event.target2, 'water');
			}
			if (!result.links) {
				event.target2.addJudge({ name: 'xumou_jsrg' }, [card]);
			} else if (result.links[0][2] == card.name) {
				event.target2.addJudge(card);
			} else {
				event.target2.addJudge({ name: result.links[0][2] }, [card]);
			}
			game.updateRoundNumber();
			event.finish();
			('step 12');
			const list66 = [];
			for (const yb of lib.inpile) {
				if (lib.card[yb].type == 'equip') {
					list66.add([get.type2(yb), '', yb]);
				}
			}
			player.chooseButton(['纵丝', '令' + ('<span class=yellowtext>' + get.translation(card) + '</span>') + '视为什(shén)么？选择原牌名则不会转化<br>(知道有多音字,所以特意标上了读音[机智])', [list66, 'vcard']]).set('prompt2', '将此牌转化为什(shén)么？选择原牌名则不会转化,取消则蓄谋<br>(知道有多音字,所以特意标上了读音[机智])');
			('step 13');
			if (event.target1) {
				event.target1.$give(card, event.target2);
			}

			if (!result.links) {
				event.target2.equip(card);
			} else if (result.links[0][2] == card.name) {
				event.target2.equip(card);
			} else {
				event.target2.equip({ name: result.links[0][2] }, [card]);
			}

			game.updateRoundNumber();
			event.finish();
		},
		ai: {
			order: 10,
			result: { player: 1 },
		},
	},

	xinfu_ybfalu: {
		forced: true,
		audio: 'xinfu_falu',
		trigger: {
			player: ['loseAfter', 'enterGame'],
			global: 'phaseBefore',
		},
		filter(event, player) {
			if (event.name != 'lose') {
				return event.name != 'phase' || game.phaseNumber == 0;
			}
			if (event.type != 'discard') {
				return false;
			}
			for (let i = 0; i < event.cards2.length; i++) {
				if (!player.hasMark('xinfu_falu_' + event.cards2[i].suit) || player.countMark('xinfu_falu_' + event.cards2[i].suit) < 3) {
					return true;
				} else if (player.countMark('xinfu_falu_' + event.cards2[i].suit) >= 3 && player.countMark('xinfu_falu_none') < 3) {
					return true;
				}
			}
			return false;
		},
		content() {
			if (trigger.name != 'lose') {
				const list66 = ['spade', 'heart', 'club', 'diamond', 'none'];
				for (let i = 0; i < list66.length; i++) {
					if (!player.hasMark('xinfu_falu_' + list66[i])) {
						player.addMark('xinfu_falu_' + list66[i]);
					}
				}
				return;
			}
			for (let i = 0; i < trigger.cards2.length; i++) {
				const suit = trigger.cards2[i].suit;
				if (!player.hasMark('xinfu_falu_' + suit) || player.countMark('xinfu_falu_' + suit) < 3) {
					player.addMark('xinfu_falu_' + suit);
				} else if (player.countMark('xinfu_falu_' + suit) >= 3 && player.countMark('xinfu_falu_none') < 3) {
					player.addMark('xinfu_falu_none');
				}
			}
		},
		ai: { threaten: 1.4 },
	},
	xinfu_falu_none: {
		marktext: '◈',
		intro: {
			name: '虚无',
			content: 'mark',
		},
	},
	xinfu_ybzhenyi: {
		group: ['xinfu_ybzhenyi_spade', 'xinfu_ybzhenyi_club', 'xinfu_ybzhenyi_heart'],
		trigger: {
			player: 'damageEnd',
		},
		audio: 'xinfu_zhenyi',
		filter(event, player) {
			return player.hasMark('xinfu_falu_diamond') || player.hasMark('xinfu_falu_none');
		},
		prompt2: '弃置「勾陈♦️️」标记,从牌堆中获得每种类型的牌各一张',
		content() {
			'step 0';
			if (player.hasMark('xinfu_falu_diamond')) {
				player.removeMark('xinfu_falu_diamond');
			} else {
				player.removeMark('xinfu_falu_none');
			}
			event.num = 0;
			event.togain = [];
			('step 1');
			let card = get.cardPile(function (card) {
				for (let i = 0; i < event.togain.length; i++) {
					if (get.type(card, 'trick') == get.type(event.togain[i], 'trick')) {
						return false;
					}
				}
				return true;
			});
			if (card) {
				event.togain.push(card);
				event.num++;
				if (event.num < 3) {
					event.redo();
				}
			}
			('step 2');
			if (event.togain.length) {
				player.gain(event.togain, 'gain2');
			}
		},
		subSkill: {
			spade: {
				trigger: {
					global: 'judge',
				},
				forced: true,
				filter(event, player) {
					return player.hasMark('xinfu_falu_spade') || player.hasMark('xinfu_falu_none');
				},
				content() {
					'step 0';
					let str = get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' + get.translation(trigger.player.judging[0]) + ',是否发动【真仪】,弃置「紫薇♠️️」标记并修改判定结果？';
					player
						.chooseControl('spade', 'heart', 'diamond', 'club', 'cancel2')
						.set('prompt', str)
						.set('ai', function () {
							const judging = _status.event.judging;
							const trigger = _status.event.getTrigger();
							const res1 = trigger.judge(judging);
							let list = lib.suit.slice(0);
							const attitude = get.attitude(player, trigger.player);
							if (attitude == 0) {
								return 0;
							}
							const getj = function (suit) {
								return trigger.judge({
									name: judging.name,
									nature: get.nature(judging),
									suit: suit,
									number: 5,
								});
							};
							list.sort(function (a, b) {
								return (getj(b) - getj(a)) * get.sgn(attitude);
							});
							if ((getj(list[0]) - res1) * attitude > 0) {
								return list[0];
							}
							return 'cancel2';
						})
						.set('judging', trigger.player.judging[0]);
					('step 1');
					if (result.control != 'cancel2') {
						player.addExpose(0.25);
						if (player.hasMark('xinfu_falu_spade')) {
							player.removeMark('xinfu_falu_spade');
						} else {
							player.removeMark('xinfu_falu_none');
						}

						player.popup(result.control);
						game.log(player, '将判定结果改为了', '#y' + get.translation(result.control + 2) + 5);
						trigger.fixedResult = {
							suit: result.control,
							color: get.color({ suit: result.control }),
							number: 5,
						};
					}
				},
				ai: {
					rejudge: true,
					tag: {
						rejudge: 1,
					},
					expose: 0.5,
				},
			},
			club: {
				audio: 'xinfu_zhenyi',
				enable: 'chooseToUse',
				viewAsFilter(player) {
					if (player == _status.currentPhase) {
						return false;
					}
					return (player.hasMark('xinfu_falu_club') || player.hasMark('xinfu_falu_none')) && player.countCards('hs') > 0;
				},
				filterCard: true,
				position: 'hs',
				viewAs: {
					name: 'tao',
				},
				prompt: '弃置「后土♣️️」标记,将一张手牌当桃使用',
				check(card) {
					return 15 - get.value(card);
				},
				precontent() {
					if (player.hasMark('xinfu_falu_club')) {
						player.removeMark('xinfu_falu_club');
					} else {
						player.removeMark('xinfu_falu_none');
					}
				},
			},
			heart: {
				trigger: {
					source: 'damageBegin1',
				},
				audio: 'xinfu_zhenyi',
				filter(event, player) {
					return player.hasMark('xinfu_falu_heart') || player.hasMark('xinfu_falu_none');
				},
				check(event, player) {
					if (get.attitude(player, event.player) >= 0) {
						return false;
					}
					if (
						event.player.hasSkillTag('filterDamage', null, {
							player: player,
							card: event.card,
						})
					) {
						return false;
					}
					return true;
				},
				prompt2(event) {
					return '弃置「玉清♥️️」标记,令对' + get.translation(event.player) + '即将造成的伤害+1';
				},
				logTarget: 'player',
				content() {
					if (player.hasMark('xinfu_falu_heart')) {
						player.removeMark('xinfu_falu_heart');
					} else {
						player.removeMark('xinfu_falu_none');
					}
					trigger.num++;
				},
			},
		},
	},
	xinfu_ybdianhua: {
		trigger: {
			player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
		},
		forced: true,
		audio: 'xinfu_dianhua',
		filter(event, player) {
			let list = ['spade', 'heart', 'club', 'diamond', 'none'];
			for (let i = 0; i < list.length; i++) {
				if (player.hasMark('xinfu_falu_' + list[i])) {
					return true;
				}
			}
			return false;
		},
		content() {
			'step 0';
			let num = 0;
			const list66 = ['spade', 'heart', 'club', 'diamond', 'none'];
			for (let i = 0; i < list66.length; i++) {
				if (player.hasMark('xinfu_falu_' + list66[i])) {
					num += player.countMark('xinfu_falu_' + list66[i]);
				}
			}
			let cards = get.cards(num);
			game.cardsGotoOrdering(cards);
			let next = player.chooseToMove();
			next.set('list', [['牌堆顶', cards], ['牌堆底']]);
			next.set('prompt', '点化:点击将牌移动到牌堆顶或牌堆底');
			next.processAI = function (list) {
				let cards = list[0][1],
					player = _status.event.player;
				let target = _status.event.getTrigger().name == 'phaseZhunbei' ? player : player.next;
				let att = get.sgn(get.attitude(player, target));
				const top = [];
				const judges = target.getCards('j');
				let stopped = false;
				if (player != target || !target.hasWuxie()) {
					for (let i = 0; i < judges.length; i++) {
						const judge = get.judge(judges[i]);
						cards.sort(function (a, b) {
							return (judge(b) - judge(a)) * att;
						});
						if (judge(cards[0]) * att < 0) {
							stopped = true;
							break;
						} else {
							top.unshift(cards.shift());
						}
					}
				}
				let bottom;
				if (!stopped) {
					cards.sort(function (a, b) {
						return (get.value(b, player) - get.value(a, player)) * att;
					});
					while (cards.length) {
						if (get.value(cards[0], player) <= 5 == att > 0) {
							break;
						}
						top.unshift(cards.shift());
					}
				}
				bottom = cards;
				return [top, bottom];
			};
			('step 1');
			const top = result.moved[0];
			let bottom = result.moved[1];
			top.reverse();
			for (let i = 0; i < top.length; i++) {
				ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
			}
			for (let i = 0; i < bottom.length; i++) {
				ui.cardPile.appendChild(bottom[i]);
			}
			player.popup(get.cnNumber(top.length) + '上' + get.cnNumber(bottom.length) + '下');
			game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');
			game.updateRoundNumber();
		},
		ai: {
			threaten: 2.2,
		},
	},

	ybsl_qixing: {
		audio: 'qixing',
		trigger: {
			global: 'phaseBefore',
			player: 'enterGame',
		},
		forced: true,
		filter(event, player) {
			return event.name != 'phase' || game.phaseNumber == 0;
		},
		content() {
			'step 0';
			player.addToExpansion(get.cards(7), 'draw').gaintag.add('qixing');
			('step 1');
			let cards = player.getExpansions('qixing');
			if (!cards.length || !player.countCards('h')) {
				event.finish();
				return;
			}
			let next = player.chooseToMove('七星:是否交换<星>和手牌？');
			next.set('list', [
				[get.translation(player) + '(你)的星', cards],
				['手牌区', player.getCards('h')],
			]);
			next.set('filterMove', function (from, to) {
				return typeof to != 'number';
			});
			next.set('processAI', function (list) {
				let player = _status.event.player,
					cards = list[0][1].concat(list[1][1]).sort(function (a, b) {
						return get.useful(a) - get.useful(b);
					}),
					cards2 = cards.splice(0, player.getExpansions('qixing').length);
				return [cards2, cards];
			});
			('step 2');
			if (result.bool) {
				const pushs = result.moved[0],
					gains = result.moved[1];
				pushs.removeArray(player.getExpansions('qixing'));
				gains.removeArray(player.getCards('h'));
				if (!pushs.length || pushs.length != gains.length) {
					return;
				}
				player.addToExpansion(pushs, player, 'giveAuto').gaintag.add('qixing');

				player.gain(gains, 'draw');
			}
		},
		intro: {
			markcount(storage, player) {
				const content = player.getExpansions('qixing');
				return content.length;
			},
			mark(dialog, content, player) {
				const content = player.getExpansions('qixing');
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						dialog.addAuto(content);
					} else {
						return '共有' + get.cnNumber(content.length) + '张星';
					}
				}
			},
			content(content, player) {
				const content = player.getExpansions('qixing');
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						return get.translation(content);
					}
					return '共有' + get.cnNumber(content.length) + '张星';
				}
			},
		},
		group: ['ybsl_qixing_2'],
		ai: { combo: 'dawu' },
		subSkill: {
			2: {
				trigger: {
					player: 'phaseDrawAfter',
				},
				prompt: '收回所有星,并将至多七张手牌充入星',
				content() {
					'step 0';
					player.gain(player.getExpansions('qixing'), 'gain2');
					('step 1');
					player.chooseCard('h', [1, 7], '将至多七张手牌置于武将牌上称为星').set('ai', function (card) {
						return 6 - get.value(card);
					});
					('step 2');
					game.log(player, '将', result.cards, '作为<星>置于武将牌上');
					player.addToExpansion(result.cards, player, 'giveAuto').gaintag.add('qixing');
				},
			},
		},
	},
	ybsl_kuangfeng: {
		audio: 'kuangfeng',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.getExpansions('qixing').length;
		},
		filterTarget(card, player, target) {
			return !target.hasSkill('kuangfeng2');
		},
		selectTarget: 1,
		content() {
			'step 0';
			target.addAdditionalSkill(`kuangfeng_${player.playerid}`, 'kuangfeng2');
			target.markAuto('kuangfeng2', [player]);
			player.addTempSkill('kuangfeng3', { player: 'phaseBeginStart' });
			player.chooseCardButton('选择弃置' + get.cnNumber(1) + '张<星>', 1, player.getExpansions('qixing'), true);
			('step 1');
			player.loseToDiscardpile(result.links);
		},
		ai: { combo: 'ybsl_qixing' },
		group: 'ybsl_kuangfeng_66',
		subSkill: {
			66: {
				audio: 'kuangfeng',
				trigger: { player: 'phaseJieshuBegin' },
				forced: true,
				filter(event, player) {
					return player.getExpansions('qixing').length;
				},
				content() {
					'step 0';
					player.chooseTarget(get.prompt('kuangfeng'), '令一名角色获得<狂风>标记', function (card, player, target) {
						return !target.hasSkill('kuangfeng2');
					}).ai = function (target) {
						return -1;
					};
					('step 1');
					if (result.bool) {
						const targets = result.targets.sortBySeat();
						const length = targets.length;
						targets.forEach((target) => {
							target.addAdditionalSkill(`kuangfeng_${player.playerid}`, 'kuangfeng2');
							target.markAuto('kuangfeng2', [player]);
						});
						player.addTempSkill('kuangfeng3', { player: 'phaseBeginStart' });
						player.chooseCardButton('选择弃置' + get.cnNumber(length) + '张<星>', length, player.getExpansions('qixing'), true);
					} else {
						event.finish();
					}
					('step 2');
					player.loseToDiscardpile(result.links);
				},
			},
		},
	},

	hina_ybshenshi: {
		firstDo: true,
		groupSkill: true,
		trigger: { player: ['phaseUseBegin', 'phaseUseEnd'] },
		forced: true,
		filter(event, player) {
			return player.group == 'shen';
		},
		content() {
			'step 0';
			player.draw(2).gaintag = ['hina_shenshi'];
			player.addSkill('hina_shenshi_yingbian');
			('step 1');
			let cards = player.getCards('h', function (card) {
				return true;
			});
			if (!cards.length) {
				event.finish();
			} else if (cards.length == 1) {
				event._result = { bool: true, cards: cards };
			} else {
				player.chooseCard('h', true, '将一张牌置于牌堆顶');
			}
			('step 2');
			if (result.bool) {
				game.log(player, '将一张牌置于了牌堆顶');
				player.lose(result.cards, ui.cardPile, 'insert');
				player.$throw(1, 1000);
			} else {
				event.finish();
			}
			('step 3');
		},
		onremove(player) {
			player.removeGaintag('hina_shenshi');
		},
		mod: {
			ignoredHandcard(card, player) {
				if (card.hasGaintag('hina_shenshi')) {
					return true;
				}
			},
			cardDiscardable(card, player, name) {
				if (name == 'phaseDiscard' && card.hasGaintag('hina_shenshi')) {
					return false;
				}
			},
		},
		group: 'hina_shenshi_yingbian',
	},

	kotori_ybyumo: {
		trigger: {
			global: ['phaseBefore', 'die'],
			player: 'enterGame',
		},
		forced: true,
		charlotte: true,
		filter(event, player) {
			return event.name != 'phase' || game.phaseNumber == 0 || event.name == 'die';
		},
		content() {
			let list = ['wei', 'shu', 'wu', 'qun', 'jin', 'key', 'YB_memory', 'YB_dream'];
			for (const i of list) {
				if (player.countMark('kotori_yumo_' + i) < 3) {
					player.addMark('kotori_yumo_' + i, 1, false);
					game.log(player, '获得了一个', lib.translate['kotori_yumo_' + i].replace(/魔物/g, '【魔物】'));
				}
			}
		},
		group: ['kotori_ybyumo_damage', 'kotori_ybyumo_gain'],
		subSkill: {
			damage: {
				trigger: { global: 'damageEnd', player: 'phaseBegin' },
				forced: true,
				filter(event, player) {
					let name = 'kotori_yumo_' + event.player.group;
					return (lib.skill[name] && player.countMark(name) < 3) || event.player.group == 'shen';
				},
				popup: false,
				content() {
					'step 0';
					game.log(player, '对', trigger.player, '发动了', '#g【驭魔】');
					if (trigger.player.group == 'shen') {
						event.num = 0;
						event.goto(1);
					} else {
						const group = trigger.player.group;
						player.popup('驭魔', get.groupnature(group));
						player.addMark('kotori_yumo_' + group, 1, false);
						game.log(player, '获得了一个', lib.translate['kotori_yumo_' + group].replace(/魔物/g, '【魔物】'));
						event.finish();
					}
					('step 1');
					event.num++;
					event.list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
					event.list2 = [];
					for (const i of event.list) {
						if (player.countMark('kotori_yumo_' + i) < 3) {
							event.list2.push(i);
						}
					}
					('step 2');
					if (event.list2.length) {
						const group = event.list2.randomGets(1);
						player.popup('驭魔', get.groupnature(group[0]));
						player.addMark('kotori_yumo_' + group[0], 1, false);
						game.log(player, '获得了一个', lib.translate['kotori_yumo_' + group[0]].replace(/魔物/g, '【魔物】'));
					} else {
						event.goto(3);
					}
					('step 3');
					if (event.num && event.num < 2) {
						event.goto(1);
					} else {
						event.finish();
					}
				},
			},
			gain: {
				trigger: { player: 'phaseBegin' },
				forced: true,
				filter(event, player) {
					let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
					for (let i in list) {
						if (player.hasMark('kotori_yumo_' + list[i])) {
							return true;
						}
					}
					return false;
				},
				content() {
					'step 0';
					event.list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
					event.list2 = [];
					for (const i of event.list) {
						if (player.hasMark('kotori_yumo_' + i)) {
							event.list2.push('kotori_skill_' + i);
						}
					}
					event.list2.push('cancel2');
					('step 1');
					player
						.chooseControl(event.list2)
						.set('prompt', '###是否发动【驭魔】？###弃置对应的标记并获得下列技能中的一个,或点取消,不获得技能')
						.set(
							'choice',
							(function () {
								if (
									event.list2.includes('kotori_skill_shu') &&
									player.countCards('h', function (card) {
										return card.name == 'sha' && player.getUseValue(card) > 0;
									}) > 1
								) {
									return 'kotori_skill_shu';
								}
								if (event.list2.includes('kotori_skill_key') && player.hp > 1) {
									return 'kotori_skill_key';
								}
								if (event.list2.includes('kotori_skill_qun') && player.isDamaged() && player.needsToDiscard() > 1) {
									return 'kotori_skill_qun';
								}
								return 'cancel2';
							})(),
						)
						.set('ai', function () {
							return _status.event.choice;
						});
					('step 2');
					if (result.control != 'cancel2') {
						let name = 'kotori_yumo_' + result.control.slice(13);
						player.removeMark(name, 1, false);
						game.log(player, '移去了一个', lib.translate[name].replace(/魔物/g, '【魔物】'));
						player.addTempSkill(result.control);
						game.log(player, '获得了技能', lib.translate[name].replace(/魔物/g, '【' + get.translation(result.control) + '】'));
						event.list2.remove(result.control);
						event.goto(1);
					}
				},
			},
		},
	},
	kotori_yumo_YB_memory: {
		marktext: "<span style='color: #28e3ce'>魔</span>",
		intro: { name: "<span style='color: #28e3ce'>魔物</span>", content: 'mark' },
	},
	kotori_yumo_YB_dream: {
		marktext: "<span style='color: #e328b7'>魔</span>",
		intro: { name: "<span style='color: #e328b7'>魔物</span>", content: 'mark' },
	},
	kotori_skill_YB_memory: {
		trigger: {
			player: 'phaseEnd',
		},
		forced: true,
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
	kotori_skill_YB_dream: {
		audio: 'ext:夜白神略/image/audio:2',
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		groupSkill: true,
		forced: true,
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
			player.addTempSkill('kotori_skill_YB_dream_buff');
		},
		subSkill: {
			buff: {
				mark: true,
				marktext: '散',
				trigger: {
					player: 'phaseDiscardBefore',
				},
				forced: true,
				content() {
					'step 0';
					player
						.chooseToDiscard(2, 'he')
						.set('prompt', '是否弃置两张牌,取消此次手牌上限减一？')
						.set('ai', function (card) {
							return player.countCards('h') > player.getHandcardLimit();
						});
					('step 1');
					if (result.bool) {
						player.removeSkill('kotori_skill_YB_dream_buff');
					}
				},
				intro: {
					content: '本回合手牌上限-1',
				},
				mod: {
					maxHandcard(player, num) {
						return num - 1;
					},
				},
			},
		},
	},
	kotori_ybhuazhan: {
		charlotte: true,
		enable: 'chooseToUse',
		filter(event, player) {
			let bool = false;
			let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
			for (const i of list) {
				if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan2').includes('kotori_yumo_' + i)) {
					bool = true;
					break;
				}
			}
			return bool && event.filterCard({ name: 'kaihua' }, player, event);
		},
		chooseButton: {
			dialog(event, player) {
				return ui.create.dialog('###花绽###' + lib.translate.kotori_huazhan_info);
			},
			chooseControl(event, player) {
				let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
				const list2 = [];
				for (const i of list) {
					if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan2').includes('kotori_yumo_' + i)) {
						list2.push('kotori_yumo_' + i);
					}
				}
				list2.push('cancel2');
				return list2;
			},
			check() {
				const player = _status.event.player;
				let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
				const list2 = [];
				for (const i of list) {
					if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan2').includes('kotori_yumo_' + i)) {
						list2.push('kotori_yumo_' + i);
					}
				}
				if (list2.includes('kotori_yumo_wei')) {
					return 'kotori_yumo_wei';
				}
				if (list2.includes('kotori_yumo_wu')) {
					return 'kotori_yumo_wu';
				}
				if (list2.includes('kotori_yumo_qun')) {
					return 'kotori_yumo_qun';
				}
				if (list2.includes('kotori_yumo_key')) {
					return 'kotori_yumo_key';
				}
				if (list2.includes('kotori_yumo_YB_memory')) {
					return 'kotori_yumo_YB_memory';
				}
				if (list2.includes('kotori_yumo_YB_dream')) {
					return 'kotori_yumo_YB_dream';
				}
				if (
					list2.includes('kotori_yumo_shu') &&
					game.hasPlayer(function (current) {
						return current.group == 'shu';
					})
				) {
					return 'kotori_yumo_shu';
				}
				return 'cancel2';
			},
			backup(result, player) {
				return {
					markname: result.control,
					viewAs: { name: 'kaihua' },
					filterCard() {
						return false;
					},
					selectCard: -1,
					precontent() {
						delete event.result.skill;
						let name = lib.skill.kotori_huazhan_backup.markname;
						if (!player.storage.kotori_huazhan2) {
							player.storage.kotori_huazhan2 = [];
						}
						player.storage.kotori_huazhan2.push(name);
						player.addTempSkill('kotori_huazhan2');
						player.popup('花绽', get.groupnature(name.slice(12)));
						game.log(player, '发动了技能', lib.translate[name].replace(/魔物/g, '【花绽】'));
						player.removeMark(name, 1, false);
						game.log(player, '移去了一个', lib.translate[name].replace(/魔物/g, '【魔物】'));
					},
				};
			},
		},
		ai: {
			order: 1,
			result: {
				player(player) {
					if (
						player.countCards('he', function (card) {
							if (get.type(card, player) == 'equip') {
								return get.value(card) < 6;
							}
							return get.value(card) < 5;
						}) < 2
					) {
						return 0;
					}
					return player.getUseValue({ name: 'kaihua' });
				},
			},
		},
		group: ['kotori_ybhuazhan_fly', 'kotori_ybhuazhan_recover'],
		subSkill: {
			fly: {
				name: '花飞',
				charlotte: true,
				enable: 'chooseToUse',
				filter(event, player) {
					let bool = false;
					let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
					for (const i of list) {
						if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan3').includes('kotori_yumo_' + i)) {
							bool = true;
							break;
						}
					}
					return bool && event.filterCard({ name: 'kaihua' }, player, event);
				},
				chooseButton: {
					dialog(event, player) {
						return ui.create.dialog('###花绽###' + lib.translate.kotori_huazhan_info);
					},
					chooseControl(event, player) {
						let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
						const list2 = [];
						for (const i of list) {
							if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan3').includes('kotori_yumo_' + i)) {
								list2.push('kotori_yumo_' + i);
							}
						}
						list2.push('cancel2');
						return list2;
					},
					check() {
						const player = _status.event.player;
						let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
						const list2 = [];
						for (const i of list) {
							if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan3').includes('kotori_yumo_' + i)) {
								list2.push('kotori_yumo_' + i);
							}
						}
						if (list2.includes('kotori_yumo_wei')) {
							return 'kotori_yumo_wei';
						}
						if (list2.includes('kotori_yumo_wu')) {
							return 'kotori_yumo_wu';
						}
						if (list2.includes('kotori_yumo_qun')) {
							return 'kotori_yumo_qun';
						}
						if (list2.includes('kotori_yumo_key')) {
							return 'kotori_yumo_key';
						}
						if (list2.includes('kotori_yumo_YB_memory')) {
							return 'kotori_yumo_YB_memory';
						}
						if (list2.includes('kotori_yumo_YB_dream')) {
							return 'kotori_yumo_YB_dream';
						}
						if (
							list2.includes('kotori_yumo_shu') &&
							game.hasPlayer(function (current) {
								return current.group == 'shu';
							})
						) {
							return 'kotori_yumo_shu';
						}
						return 'cancel2';
					},
					backup(result, player) {
						return {
							markname: result.control,
							viewAs: { name: 'yihuajiemu' },
							filterCard() {
								return false;
							},
							selectCard: -1,
							precontent() {
								delete event.result.skill;
								let name = lib.skill.kotori_huazhan_fly_backup.markname;
								if (!player.storage.kotori_huazhan3) {
									player.storage.kotori_huazhan3 = [];
								}
								player.storage.kotori_huazhan3.push(name);
								player.addTempSkill('kotori_huazhan3');
								player.popup('花绽', get.groupnature(name.slice(12)));
								game.log(player, '发动了技能', lib.translate[name].replace(/魔物/g, '【花绽】'));
								player.removeMark(name, 1, false);
								game.log(player, '移去了一个', lib.translate[name].replace(/魔物/g, '【魔物】'));
							},
						};
					},
				},
				ai: {
					order: 7,
					result: {
						target(player, target) {
							return player.getUseValue({ name: 'yihuajiemu' });
						},
					},
				},
			},
			recover: {
				name: '愈伤',
				charlotte: true,
				enable: 'chooseToUse',
				filter(event, player) {
					let bool = false;
					let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
					for (const i of list) {
						if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan4').includes('kotori_yumo_' + i)) {
							bool = true;
							break;
						}
					}
					return bool && event.filterCard({ name: 'kaihua' }, player, event);
				},
				chooseButton: {
					dialog(event, player) {
						return ui.create.dialog('###花绽###' + lib.translate.kotori_huazhan_info);
					},
					chooseControl(event, player) {
						let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
						const list2 = [];
						for (const i of list) {
							if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan4').includes('kotori_yumo_' + i)) {
								list2.push('kotori_yumo_' + i);
							}
						}
						list2.push('cancel2');
						return list2;
					},
					check() {
						const player = _status.event.player;
						let list = ['wei', 'shu', 'wu', 'qun', 'key', 'jin', 'YB_memory', 'YB_dream'];
						const list2 = [];
						for (const i of list) {
							if (player.hasMark('kotori_yumo_' + i) && !player.getStorage('kotori_huazhan4').includes('kotori_yumo_' + i)) {
								list2.push('kotori_yumo_' + i);
							}
						}
						if (list2.includes('kotori_yumo_wei')) {
							return 'kotori_yumo_wei';
						}
						if (list2.includes('kotori_yumo_wu')) {
							return 'kotori_yumo_wu';
						}
						if (list2.includes('kotori_yumo_qun')) {
							return 'kotori_yumo_qun';
						}
						if (list2.includes('kotori_yumo_key')) {
							return 'kotori_yumo_key';
						}
						if (list2.includes('kotori_yumo_YB_memory')) {
							return 'kotori_yumo_YB_memory';
						}
						if (list2.includes('kotori_yumo_YB_dream')) {
							return 'kotori_yumo_YB_dream';
						}
						if (
							list2.includes('kotori_yumo_shu') &&
							game.hasPlayer(function (current) {
								return current.group == 'shu';
							})
						) {
							return 'kotori_yumo_shu';
						}
						return 'cancel2';
					},
					backup(result, player) {
						return {
							markname: result.control,
							viewAs: { name: 'guaguliaodu' },
							filterCard() {
								return false;
							},
							selectCard: -1,
							precontent() {
								delete event.result.skill;
								let name = lib.skill.kotori_huazhan_recover_backup.markname;
								if (!player.storage.kotori_huazhan4) {
									player.storage.kotori_huazhan4 = [];
								}
								player.storage.kotori_huazhan4.push(name);
								player.addTempSkill('kotori_huazhan4');
								player.popup('花绽', get.groupnature(name.slice(12)));
								game.log(player, '发动了技能', lib.translate[name].replace(/魔物/g, '【花绽】'));
								player.removeMark(name, 1, false);
								game.log(player, '移去了一个', lib.translate[name].replace(/魔物/g, '【魔物】'));
							},
						};
					},
				},
				ai: {
					order: 2,
					tag: {
						recover: 1,
					},
					result: {
						target(player, target) {
							return player.getUseValue({ name: 'guaguliaodu' });
						},
					},
				},
			},
		},
	},
	kotori_huazhan3: { onremove: true },
	kotori_huazhan4: { onremove: true },

	xinfu_ybjingxie: {
		getJingxie() {
			return ['bagua', 'baiyin', 'lanyinjia', 'renwang', 'tengjia', 'zhuge', 'ybsl_wangzhui', 'chitu', 'zhuque', 'wuxinghelingshan', 'yitianjian', 'shandian', 'fulei', 'taigongyinfu', 'ybsl_tianleiyubi', 'hongshui', 'huoshan', 'chiyanzhenhunqin', 'tongque', 'qinglong', 'fangtian', 'wutiesuolian', 'huxinjing', 'goujiangdesidai'];
		},
		firstDo: true,

		group: ['xinfu_jingxie_recast'],
		position: 'he',
		audio: 'xinfu_jingxie',
		enable: 'phaseUse',
		filter(event, player) {
			const he = player.getCards('he');
			let list = _status.YB_jingxieList;
			for (let i = 0; i < he.length; i++) {
				if (list.includes(he[i].name)) {
					return true;
				}
			}
			return false;
		},
		filterCard(card, player) {
			let list = _status.YB_jingxieList;
			return list.includes(card.name);
		},
		discard: false,
		lose: false,
		delay: false,
		check() {
			return 1;
		},
		content() {
			'step 0';
			player.showCards(cards);
			('step 1');
			let card = cards[0];
			let bool = get.position(card) == 'e';

			if (bool) {
				player.removeEquipTrigger(card);
			}
			game.addVideo('skill', player, ['xinfu_ybjingxie', [bool, get.cardInfo(card)]]);
			game.broadcastAll(
				function (card, bool) {
					if (card.name == 'wuxinghelingshan') {
						card.name = 'zhuque';
					}
					if (card.name == 'chiyanzhenhunqin') {
						card.name = 'zhuque';
					}
					if (card.name == 'shandian' && card.suit == 'spade') {
						card.name = 'fulei';
					}
					if (card.name == 'taigongyinfu') {
						card.name = 'fulei';
					}
					if (card.name == 'hongshui') {
						card.name = 'shandian';
					}
					if (card.name == 'huoshan') {
						card.name = 'shandian';
					}
					if (card.name == 'wutiesuolian') {
						card.name = 'fangtian';
					}
					const tag = get.YB_tag(card);
					card.YB_init([card.suit, card.number, 'rewrite_' + card.name, card.nature, tag]);

					if (bool && card.card && player.vcardsMap?.equips) {
						const cardx = game.YB_createCard('rewrite_' + card.card.name, card.card.suit, card.card.number);
						player.vcardsMap.equips[player.vcardsMap.equips.indexOf(card.card)] = cardx;
						card.card = cardx;
					}
				},
				card,
				bool,
			);
			if (bool) {
				player.addEquipTrigger(card.card || card);
			}
		},
		ai: {
			basic: {
				order: 10,
			},
			result: {
				player: 1,
			},
		},
	},

	ybsl_zigong: {
		audio: 'nzry_shicai',
		trigger: {
			player: 'gainEnd',
		},
		filter(event, player) {
			if (event.getParent(2).name == 'ybsl_zigong') {
				return false;
			}
			return true;
		},
		content: async function (event, trigger, player) {
			let cards = trigger.cards;
			let num = Math.min(cards.length, 5);
			await player.discard(trigger.cards);
			await player.draw(num);
		},
	},
	ybsl_zicai: {
		audio: 'nzry_chenglve',
		trigger: {
			player: 'discardAfter',
		},
		derivation: 'ybsl_zhaosanmusi',
		content: async function (event, trigger, player) {
			let cards = trigger.cards;
			let num = Math.min(cards.length, 5);
			switch (num) {
				case 0:
					event.finish();
					break;
				case 1:
					await player.chooseUseTarget(
						{
							name: 'sha',
							nature: 'fire',
						},
						cards,
						'请选择火【杀】的目标',
						false,
					);
					break;
				case 2:
					await player.chooseUseTarget(
						{
							name: 'diaobingqianjiang',
						},
						cards,
						'是否使用【调兵谴将】',
						false,
					);
					break;
				case 3:
					await player.chooseUseTarget(
						{
							name: 'yiyi',
						},
						cards,
						'是否使用【以逸待劳】',
						false,
					);
					break;
				case 4:
					await player.chooseUseTarget(
						{
							name: 'zengbin',
						},
						cards,
						'是否使用【增兵减灶】',
						false,
					);
					break;
				default:
					await player.chooseUseTarget(
						{
							name: 'ybsl_zhaosanmusi',
						},
						cards,
						'是否使用【朝三暮四】',
						false,
					);
					break;
			}
		},
	},

	niya_limu: {
		mod: {
			targetInRange(card, player, target) {
				if (player.countCards('j') && player.inRange(target)) {
					return true;
				}
			},
			cardUsableTarget(card, player, target) {
				if (player.countCards('j') && player.inRange(target)) {
					return true;
				}
			},
			aiOrder(player, card, num) {
				if (get.type(card, null, player) == 'trick' && player.canUse(card, player) && player.canAddJudge(card)) {
					return 15;
				}
			},
		},
		audio: 'xinfu_limu',
		enable: 'phaseUse',
		discard: false,
		filter(event, player) {
			if (player.hasJudge('shandian') && player.hasJudge('lebu') && player.hasJudge('bingliang') && player.hasJudge('niya_wangmeizhike')) {
				return false;
			}
			return (
				player.countCards('hes', function (card) {
					return ['spade', 'heart', 'club', 'diamond'].includes(card.suit);
				}) > 0
			);
		},

		viewAs(cards, player) {
			if (cards.length) {
				let name = false;

				switch (cards[0].suit) {
					case 'club':
						name = 'bingliang';
						break;
					case 'diamond':
						name = 'lebu';
						break;
					case 'spade':
						name = 'shandian';
						break;
					case 'heart':
						name = 'niya_wangmeizhike';
						break;
				}

				if (name) {
					return { name: name };
				}
			}
			return null;
		},

		position: 'hes',

		filterCard(card, player, event) {
			let name = card.suit;

			if (name == 'club' && player.canAddJudge({ name: 'bingliang', cards: [card] })) {
				return true;
			}

			if (name == 'diamond' && player.canAddJudge({ name: 'lebu', cards: [card] })) {
				return true;
			}

			if (name == 'spade' && player.canAddJudge({ name: 'shandian', cards: [card] })) {
				return true;
			}

			if (name == 'heart' && player.canAddJudge({ name: 'niya_wangmeizhike', cards: [card] })) {
				return true;
			}

			return false;
		},
		selectTarget: -1,
		filterTarget(card, player, target) {
			return player == target;
		},
		check(card) {
			const player = _status.event.player;
			if (!player.getEquip('zhangba')) {
				let damaged = player.maxHp - player.hp - 1;
				if (
					player.countCards('h', function (cardx) {
						if (cardx == card) {
							return false;
						}
						if (cardx.name == 'tao') {
							if (damaged < 1) {
								return true;
							}
							damaged--;
						}
						return ['shan', 'jiu'].includes(cardx.name);
					}) > 0
				) {
					return 0;
				}
			}
			if (card.name == 'shan') {
				return 15;
			}
			if (card.name == 'tao' || card.name == 'jiu') {
				return 10;
			}
			return 9 - get.value(card);
		},
		onuse(links, player) {
			let name = links.card.name;
			let next = game.createEvent('limu_recover', false, _status.event.parent);
			next.player = player;
			next.name = name;
			next.setContent(async function (event, trigger, player) {
				if (event.name == 'lebu') {
					await player.recover();
				} else if (event.name == 'bingliang') {
					const players = game.filterPlayer((p) => p.countDiscardableCards(player, 'he'));
					if (players) {
						let result = await player
							.chooseTarget('请选择一名角色,弃置其至多两张牌', true)
							.set('filterTarget', function (card, player, target) {
								return players.includes(target);
							})
							.forResult();
						if (result.bool) {
							await player.discardPlayerCard(result.targets[0], [1, 2], true);
						}
					}
				} else if (event.name == 'niya_wangmeizhike') {
					await player.draw(2);
				} else if (event.name == 'shandian') {
					const players = game.filterPlayer((p) => p.isIn());
					if (players) {
						let result = await player
							.chooseTarget('请选择一名角色,对其造成1点雷电伤害', true)
							.set('filterTarget', function (card, player, target) {
								return players.includes(target);
							})
							.forResult();
						if (result.bool) {
							await result.targets[0].damage(player, 1, 'thunder');
						}
					}
				}
			});
		},
		ai: {
			result: {
				target(player, target) {
					if (player.countCards('hes', 'zhangba')) {
						return player.countCards('h', { type: 'basic' });
					}
					let res = lib.card.lebu.ai.result.target(player, target);
					if (player.countCards('hs', 'sha') >= player.hp) {
						res++;
					}
					if (target.isDamaged()) {
						return res + 2 * Math.abs(get.recoverEffect(target, player, target));
					}
					return res;
				},
				ignoreStatus: true,
			},
			order(item, player) {
				if (player.hp > 1 && player.countCards('j')) {
					return 0;
				}
				return 12;
			},
			effect: {
				target(card, player, target) {
					if (target.isPhaseUsing() && typeof card === 'object' && get.type(card, null, target) === 'delay' && !target.countCards('j')) {
						const shas =
							target.getCards('hs', (i) => {
								if (card === i || (card.cards && card.cards.includes(i))) {
									return false;
								}
								return i.name === 'sha' && target.getUseValue(i) > 0;
							}) - target.getCardUsable('sha');
						if (shas > 0) {
							return [1, 1.5 * shas];
						}
					}
				},
			},
		},
	},
	niya_tushe: {
		audio: 'xinfu_tushe',
		mod: {
			aiOrder(player, card, num) {
				if (get.tag(card, 'multitarget')) {
					if (player.countCards('h', { type: 'basic' })) {
						return num / 10;
					}
					return num * 10;
				}
				if (get.type(card) === 'basic') {
					return num + 10;
				}
			},
			aiValue(player, card, num) {
				if (card.name === 'zhangba') {
					return 999;
				}
				if (['shan', 'tao', 'jiu'].includes(card.name)) {
					if (player.getEquip('zhangba') && player.countCards('hs') > 1) {
						return 0.01;
					}
					return num / 2;
				}
				if (get.tag(card, 'multitarget')) {
					return num + game.players.length;
				}
			},
			aiUseful(player, card, num) {
				if (card.name === 'zhangba') {
					return 999;
				}
				if (card.name === 'shan') {
					if (
						player.countCards('hs', (i) => {
							if (card === i || (card.cards && card.cards.includes(i))) {
								return false;
							}
							return i.name === 'shan';
						})
					) {
						return -1;
					}
					return num / Math.pow(Math.max(1, player.hp), 2);
				}
			},
		},
		trigger: {
			global: 'useCardToPlayered',
		},
		forced: true,
		filter(event, player) {
			if (get.type(event.card) == 'equip') {
				return false;
			}
			if (event.parent.triggeredTargets3.length > 1) {
				return false;
			}
			if (player.countCards('h', { type: 'basic' }) && player.hasSkill('niya_tushe_block')) {
				return false;
			}
			return event.targets.length && (event.player == player || event.targets.includes(player));
		},
		content() {
			player.addTempSkill('niya_tushe_block');
			player.draw(trigger.targets.length);
		},
		subSkill: {
			block: {
				charlotte: true,
			},
		},
		ai: {
			presha: true,
			pretao: true,
			threaten: 1.8,
			effect: {
				player_use(card, player, target) {
					if (
						typeof card === 'object' &&
						card.name !== 'shan' &&
						get.type(card) !== 'equip' &&
						!player.countCards('h', (i) => {
							if (card === i || (card.cards && card.cards.includes(i))) {
								return false;
							}
							return get.type(i) === 'basic';
						})
					) {
						let targets = [],
							evt = _status.event.getParent('useCard');
						targets.addArray(ui.selected.targets);
						if (evt && evt.card == card) {
							targets.addArray(evt.targets);
						}
						if (targets.length) {
							return [1, targets.length];
						}
						if (get.tag(card, 'multitarget')) {
							return [1, game.players.length - 1];
						}
						return [1, 1];
					}
				},
			},
		},
	},

	niya_youbo: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: ['loseHpAfter', 'loseAfter', 'loseAsyncAfter', 'equipAfter', 'cardsDiscardAfter'],
		},
		filter(event, player) {
			if (event.name == 'loseHp') {
				return true;
			}
			return event.getd?.().some((card) => get.color(card) == 'black');
		},
		content() {
			'step 0';
			let num = player.maxHp;
			event.cards = get.cards(num);

			if (Array.isArray(event.cards))
				for (const i of event.cards) {
					ui.cardPile.insertBefore(i, ui.cardPile.firstChild);
				}
			game.updateRoundNumber();
			player.chooseControl('ok').set('dialog', [event.cards]);
			event.numx = 0;
			for (const i of event.cards) {
				if (i.number) {
					event.numx += i.number;
				}
			}
			game.log(player, '本次观看牌的点数和为', event.numx, '');
			if (!player.storage.niya_youbo) {
				player.storage.niya_youbo = 0;
			}
			player.storage.niya_youbo += event.numx;
			player.update();
			('step 1');
			const numb = Math.log2(player.storage.niya_youbo);
			event.numb = Math.floor(numb);
			player.chooseBool('是否进行摸牌？(当前摸牌数为' + event.numb + ')').set('ai', function () {
				let att = get.attitude(_status.event.player, _status.currentPhase);
				if (att > 0) {
					return event.numb != _status.currentPhase.maxHp;
				} else {
					return true;
				}
			});

			('step 2');
			if (result.bool) {
				player.storage.niya_youbo = 0;
				player.update();
				const number = event.numb;
				player.draw(number);
				if (_status.currentPhase && _status.currentPhase.isIn() && number == _status.currentPhase.maxHp) {
					_status.currentPhase.loseMaxHp();
				}
			}
		},
		mark: true,
		intro: {
			markcount(storage, player) {
				return player.storage.niya_youbo || 0;
			},
		},
	},
	niya_anren: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: 'useCardToPlayered',
		},
		filter(event, player) {
			if (event.player != player) {
				return event.target == player && event.player.maxHp >= player.maxHp;
			} else {
				return event.target.maxHp <= player.maxHp;
			}
		},
		async content(event, trigger, player) {
			if (trigger.player != player) {
				const eff = get.effect(player, trigger.card, trigger.player, trigger.player);
				const result = await trigger.player
					.chooseToDiscard('暗刃:弃置一张黑色牌,否则' + get.translation(trigger.card) + '对' + get.translation(player) + '无效', function (card) {
						return get.color(card) == 'black';
					})
					.set('ai', function (card) {
						if (_status.event.eff > 0) {
							return 10 - get.value(card);
						}
						return 0;
					})
					.set('eff', eff)
					.forResult();
				if (!result?.bool) {
					trigger.parent.excluded.add(player);
				}
			} else {
				trigger.parent.directHit.add(trigger.target);
				if (!trigger.parent.card.storage.niya_anren) {
					trigger.parent.card.storage.niya_anren = [];
				}
				trigger.parent.card.storage.niya_anren.push(trigger.target);
			}
		},
		group: ['niya_anren_damage'],
		subSkill: {
			damage: {
				audio: 'niya_anren',
				trigger: {
					global: 'damageEnd',
				},
				forced: true,
				filter(event, player) {
					return event.card?.storage?.niya_anren?.includes(event.player);
				},
				content() {
					trigger.player.loseHp();
				},
			},
		},
	},
	niya_xuantu: {
		audio: 'ext:夜白神略/audio/character:2',
		group: 'niya_xuantu_use',
		subSkill: {
			use: {
				enable: 'phaseUse',
				usable: 1,
				audio: 'niya_xuantu',
				selectCard: [1, Infinity],
				filterCard: lib.filter.cardDiscardable,
				filter(event, player) {
					return player.isDamaged();
				},
				prompt: '当你受到伤害后或出牌阶段限一次,你可弃置y张牌,然后回复至多lnb点体力.b为玄途弃置y张牌的点数和',
				content() {
					let next = game.createEvent('niya_xuantu', false);
					next.player = player;
					next.cards = event.cards;
					next.setContent(lib.skill.niya_xuantu.sword);
				},
				ai: {
					rusult: {
						player: 1.1,
					},
				},
			},
		},
		trigger: { player: 'damageEnd' },
		cost() {
			event.result = player
				.chooseToDiscard([1, Infinity], 'he')
				.set('prompt', get.prompt2('niya_xuantu'))
				.set('filterCard', lib.filter.cardDiscardable)
				.set('ai', function (card) {
					const player = _status.event.player;
					let numa = player.getDamagedHp();
					if (numa > 3) {
						numa = 3;
					}
					let num = 0;
					for (const i of ui.selected.cards) {
						num += i.number;
					}
					const numb = Math.pow(Math.E, numa);
					if (num >= numb) {
						return 0;
					}
					if (card.number + num >= numb) {
						return 15 - get.value(card);
					}
					if (!ui.selected.cards.length) {
						const min = _status.event.min;
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
				.set('chooseonly', true)
				.forResult();
		},
		content() {
			let next = game.createEvent('niya_xuantu', false);
			next.player = player;
			next.cards = event.cards;
			next.setContent(lib.skill.niya_xuantu.sword);
		},
		sword() {
			'step 0';
			player.discard(event.cards);
			('step 1');
			event.numx = 0;
			for (const i of event.cards) {
				if (i.number) {
					event.numx += i.number;
				}
			}
			game.log(player, '本次弃置牌的点数和为', event.numx, '');
			('step 2');
			const numb = Math.log(event.numx);
			event.numb = Math.floor(numb);
			player.recover(event.numb);
		},
	},

	Fe2O3_huishi: {
		mod: {
			aiValue(player, card, num) {
				if (get.position(card) == 'h') {
					if (player.isPhaseUsing() && player.getUseValue(card)) {
						const name = card.name;
						let usable = player.getCardUsable(name, true) - player.countUsed(name);
						if (name == 'tao') {
							usable = Math.min(usable, player.getDamagedHp());
						}
						const cards = player.getCards('h', (cardx) => cardx.name == name);
						cards.sort((a, b) => player.getUseValue(b) - player.getUseValue(a));
						if (cards.indexOf(card) < usable) {
							return num;
						}
					}

					let next = player.next;
					if (game.hasPlayer((current) => !current.isTurnedOver())) {
						while (next.isTurnedOver()) {
							next = next.next;
						}
					}
					let att = get.sgn(get.attitude(player, next)),
						js = next.getCards('j');
					const top = [];
					for (const j of js) {
						top.push(player.getCards('h', (i) => get.judge(j)(i) * att > 0 && !top.includes(i))[0]);
					}
					if (top.includes(card)) {
						return num * 1.2;
					}

					if (att < 0) {
						return -num / 4;
					}
					return num / 4;
				}

				return num * 2;
			},
			get aiUseful() {
				return lib.skill.Fe2O3_huishi.mod.aiValue;
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: 'phaseEnd',
		},
		filter(event, player) {
			return player.countCards('h');
		},
		content: async function (event, trigger, player) {
			let cards = player.getCards('h');
			if (cards.length > 1) {
				const result = await player
					.chooseToMove('会失:将牌按顺序置于牌堆顶', true)
					.set('list', [['牌堆顶', cards]])
					.set('reverse', _status.currentPhase?.next && get.attitude(player, _status.currentPhase.next) > 0)
					.set('processAI', function (list) {
						let cards = list[0][1],
							player = _status.event.player,
							target = (_status.currentPhase || player).next,
							countWuxie = (current) => {
								let num = current.getKnownCards(player, (card) => {
									return card.name === 'wuxie';
								});
								if (num && current !== player) {
									return num;
								}
								let skills = current.getSkills('invisible').concat(lib.skill.global);
								game.expandSkills(skills);
								for (let i = 0; i < skills.length; i++) {
									const ifo = get.info(skills[i]);
									if (!ifo) {
										continue;
									}
									if (ifo.viewAs && typeof ifo.viewAs != 'function' && ifo.viewAs.name == 'wuxie') {
										if (!ifo.viewAsFilter || ifo.viewAsFilter(current)) {
											num++;
											break;
										}
									} else {
										const hiddenCard = ifo.hiddenCard;
										if (typeof hiddenCard == 'function' && hiddenCard(current, 'wuxie')) {
											num++;
											break;
										}
									}
								}
								return num;
							},
							top = [];
						if (game.hasPlayer((current) => !current.isTurnedOver())) {
							while (target.isTurnedOver()) {
								target = target.next;
							}
						}
						let att = get.sgn(get.attitude(player, target)),
							judges = target.getCards('j'),
							needs = 0,
							wuxie = countWuxie(target);
						for (let i = Math.min(cards.length, judges.length) - 1; i >= 0; i--) {
							let j = judges[i],
								cardj = j.viewAs ? { name: j.viewAs, cards: j.cards || [j] } : j;
							if (wuxie > 0 && get.effect(target, j, target, target) < 0) {
								wuxie--;
								continue;
							}
							const judge = get.judge(j);
							cards.sort((a, b) => {
								return (judge(b) - judge(a)) * att;
							});
							if (judge(cards[0]) * att < 0) {
								needs++;
								continue;
							} else {
								top.unshift(cards.shift());
							}
						}
						if (needs > 0 && needs >= judges.length) {
							return [top.concat(cards)];
						}
						cards.sort((a, b) => {
							return (get.value(b, target) - get.value(a, target)) * att;
						});
						while (needs--) {
							top.unshift(cards.shift());
						}
						while (cards.length) {
							if (get.value(cards[0], target) > 6 == att > 0) {
								top.push(cards.shift());
							} else {
								break;
							}
						}
						return [top.concat(cards)];
					})
					.forResult();
				if (!result.bool) {
					return;
				}
				cards = result.moved[0];
			}

			await player.lose(cards, ui.cardPile, 'insert');
			game.addCardKnower(cards, player);
			game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于牌堆顶');
		},
		ai: {
			neg: true,
		},
	},
	Fe2O3_xingchen: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			target: 'useCardToTargeted',
		},
		check(event, player) {
			let num = player.countMark('Fe2O3_xingchen_discard') + 1;
			if (num >= 3) {
				return player.countCards('h') + 3 > num * 2;
			}
			return true;
		},
		async cost(event, trigger, player) {
			event.result = await player.chooseBool(get.prompt2('Fe2O3_xingchen')).set('choice', lib.skill.Fe2O3_xingchen.check('丈八二桃把营连', player)).forResult();
			if (!event.result.bool) {
				return;
			}
			player.addTempSkill('Fe2O3_xingchen_used');
			player.addMark('Fe2O3_xingchen_used');
			player.markSkill('Fe2O3_xingchen_used');
		},
		async content(event, trigger, player) {
			await player.draw(3, 'bottom');
			let num = player.countMark('Fe2O3_xingchen_used');
			const next = player.chooseToDiscard('星谶:请弃置' + num + '张牌', 'he', num, true);
			next.set('cardx', trigger.card);
			next.set('Fe2O3_xingchen', true);
			next.set('sourcex', trigger.player);
			next.set('complexCard', true);
			next.set('ai', (card) => {
				let num = -get.value(card),
					cardx = get.event().cardx,
					type = get.subtype(card);

				const sourcex = get.event().source,
					eff = get.effect(player, cardx, sourcex),
					useEvent = get.event().getParent('useCard');
				if (eff < 0 && card == player.getCards('h', (i) => player.canRespond(useEvent, i, true))[0]) {
					return num - 5;
				}

				if (get.type(card) != 'equip') {
					return num;
				}
				if (get.type(cardx) != 'equip') {
					return num;
				}
				if (get.position(card) != 'e') {
					return num;
				}
				if (type != get.subtype(cardx)) {
					return num;
				}
				if (player.countEmptySlot(type)) {
					return num;
				}
				if (ui.selected.cards.some((i) => get.subtype(i) == type && get.position(i) == 'e')) {
					return num;
				}
				return 12 + num;
			});
		},
		mark: true,
		intro: {
			markcount(storage, player) {
				let num = player.countMark('Fe2O3_xingchen_used');
				return num;
			},
		},
		subSkill: {
			used: {},
		},
		ai: {
			effect: {
				target(card, player, target) {
					const num = player.countMark('Fe2O3_xingchen');
					if (num > 3 || !target.hasFriend() || get.event().Fe2O3_xingchen) {
						return;
					}
					return [1, 0.33 * (3 - num)];
				},
			},
		},
	},

	zxunnamed_qinglan: {
		forced: true,
		trigger: {
			player: 'useCardToPlayered',
		},
		filter(event, player) {
			const chosen = player.storage.zxunnamed_qinglan_chosen || [];
			const target = event.targets[0];
			if (target == player || event.targets.length != 1) {
				return false;
			}
			if (!chosen.includes(2)) {
				return true;
			}
			if (!chosen.includes(0) && target.countDiscardableCards(target, 'he')) {
				return true;
			}
			if (!chosen.includes(1) && ui.cardPile.firstChild && target.canEquip({ name: 'zheji' }, true)) {
				return true;
			}
			return false;
		},
		choiceAfter: [
			`await target.discard(result.cards)
			await target.chooseUseTarget({ name : 'jiu' }, true)`,
			`await target.useCard({ name : 'zheji' }, target, get.cards())
			await target.recover()`,
			`await game.asyncDraw([player, target].sortBySeat(_status.currentPhase || player))`,
		],
		processAI: [
			function () {
				const target = get.event().parent.player;
				const player = get.player();
				const chosen = get.event().chosen;
				const card = target.getCards('he', (card) => lib.filter.cardDiscardable(card, target) && get.useful(card) < 7).sort((a, b) => get.useful(a) - get.useful(b))[0];
				if (eval(this[1])) {
					return { links: [0], cards: [card] };
				}
				if (eval(this[2])) {
					return { links: [1] };
				}
				if (chosen.includes(2)) {
					if (!chosen.includes(0)) {
						return { links: [0], cards: [card] };
					}
					return { links: [1] };
				}
				return { links: [2] };
			},
			`(function() {
				if (chosen.includes(0)) return false
				if (get.attitude(player, target) < 0 || !target.hasSkill('zxunnamed_lingbo')) return false
				if (!player.hasValueTarget(get.autoViewAs({ name : 'sha' }, target.getCards('e')))) return false
				if (!target.countCards('e') || !card) return false
				return true
			})()`,
			`(function() {
				if (chosen.includes(1)) return false
				if (!player.canEquip({ name : 'zheji' }, true)) return false
				if (get.cacheEffectUse(player, { name : 'zheji' }, player) + player.isDamaged() * 1.5 < 0) {
					if (get.attitude(player, target) < 0 || !target.hasSkill('zxunnamed_lingbo')) return false
					if (!player.hasValueTarget(get.autoViewAs({ name : 'sha' }, target.getCards('e')))) return false
				}
				return true
			})()`,
		],
		filterButton(button) {
			const player = get.player();
			if (get.event().chosen.includes(button.link)) {
				return false;
			}
			if (button.link == 0) {
				return player.countDiscardableCards(player, 'he');
			}
			if (button.link == 1) {
				return ui.cardPile.childNodes.length && player.canEquip({ name: 'zheji' }, true);
			}
			return true;
		},
		async content(event, trigger, player) {
			player.addTempSkill('zxunnamed_qinglan_chosen');
			const target = trigger.targets[0];
			const skill = lib.skill[event.name];
			const options = ['弃置一张牌并视为使用一张【酒】', '将牌堆顶的牌当做【折戟】对自己使用并回复1点体力', `与${get.translation(player)}各摸一张牌`];
			const chosen = player.storage.zxunnamed_qinglan_chosen;
			const result = await target
				.chooseButton(
					options.map((i, j) => [[[j, i]], 'tdnodes']),
					true,
				)
				.set('processAI', skill.processAI[0])
				.set('chosen', chosen)
				.set('filterCard', lib.filter.cardDiscardable)
				.set('selectCard', () => {
					if (!ui.selected.buttons.length || !ui.selected.buttons[0].link) {
						return 1;
					}
					return 0;
				})
				.set('filterButton', skill.filterButton)
				.forResult();
			game.log(target, '选择了', '#g【轻澜】', '的', `#y选项${get.cnNumber(result.links[0] + 1, true)}`);
			chosen.add(result.links[0]);
			await eval(`(async function () {${skill.choiceAfter[result.links[0]]}})()`);
		},
		subSkill: {
			chosen: {
				init(player, skill) {
					player.storage[skill] = [];
				},
			},
		},
	},
	zxunnamed_lingbo: {
		zhuanhuanji: true,
		mark: true,
		enable: 'phaseUse',
		marktext: '☯',
		intro: {
			content: (storage) => `出牌阶段,你可以${storage ? '令一名角色将你装备区内的牌当做【杀】使用' : '将一名角色装备区内的牌当做【无中生有】对其使用'}`,
		},
		filterTarget(card, player, target) {
			const sha = get.autoViewAs({ name: 'sha' }, player.getCards('e'));
			const wuzhong = get.autoViewAs({ name: 'wuzhong' }, target.getCards('e'));
			let ok;
			if (player.storage.zxunnamed_lingbo) {
				ui.selected.cards.addArray(player.getCards('e'));
				ok = player.countCards('e') && target.hasUseTarget(sha);
			} else {
				ui.selected.cards.addArray(target.getCards('e'));
				ok = target.countCards('e') && lib.filter.targetEnabled2(wuzhong, player, target);
			}
			ui.selected.cards = [];
			return ok;
		},
		filter: (event, player) => game.hasPlayer((current) => lib.skill.zxunnamed_lingbo.filterTarget(null, player, current)),
		viewAsFilter: (player) => lib.skill.zxunnamed_lingbo.filter(null, player),
		selectTarget: 1,
		selectCard: 0,
		get viewAs() {
			if (get.player()?.storage.zxunnamed_lingbo) {
				return null;
			}
			return { name: 'wuzhong' };
		},
		discard: false,
		lose: false,
		async content(event, trigger, player) {
			const target = event.targets[0];
			ui.selected.cards.addArray(player.getCards('e'));
			const targets = game.filterPlayer((current) => target.canUse(get.autoViewAs({ name: 'sha' }, player.getCards('e')), current));
			ui.selected.cards = [];
			await target.chooseUseTarget({ name: 'sha' }, player.getCards('e'), false, true, targets, 'nodistance');
		},
		async precontent(event, trigger, player) {
			if (!player.storage.zxunnamed_lingbo) {
				event.result.cards = event.result.targets[0].getCards('e');
			}
			player.changeZhuanhuanji('zxunnamed_lingbo');
		},
		ai: {
			order: 15,
			reverseEquip: true,
			result: {
				target(player, target) {
					if (player.storage.zxunnamed_lingbo) {
						return target.getUseValue(get.autoViewAs({ name: 'sha' }, player.getCards('e')));
					}
					let val = 2 + Math.sign(get.attitude(player.target));
					target.countCards('e', (card) => (get.value(card) < 0 ? val++ : val--));
					if (target.hasSkillTag('noe')) {
						val += 2;
					}
					return val;
				},
			},
		},
	},

	Fe2O3_shuding: {
		trigger: {
			global: 'useCardAfter',
		},
		filter(event, player) {
			if (player != _status.currentPhase) {
				return false;
			}
			const suit = event.card.suit;
			if (suit == 'none') {
				return false;
			}
			return get
				.discarded()
				.filterInD('d')
				.every((card) => card.suit != suit);
		},
		forced: true,
		logTarget: 'player',
		async content(event, trigger, player) {
			await player.draw();
			const target = trigger.player;
			const { result } = await target.chooseCard(
				2,
				'he',
				`###数定###重铸两张${get.translation(get.color(trigger.card))}牌`,
				(card) => get.color(card) == get.color(trigger.card) && target.canRecast(card),
				(card) => 11 - get.value(card),
			);
			if (result.bool) {
				target.recast(result.cards);
			} else {
				target.loseHp();
			}
		},
	},
	Fe2O3_titi: {
		trigger: {
			player: 'phaseUseEnd',
		},
		forced: true,
		async content() {
			const gains = [];
			for (const target of game.filterPlayer((current) => current.hasHistory('lose', (evt) => evt.cards2?.length)).sortBySeat()) {
				if (!get.discarded().filterInD('d').length) {
					break;
				}
				const result = await target.chooseCardButton('折折:选择一张牌获得', get.discarded().filterInD('d')).forResult();
				if (result.bool) {
					await target.gain(result.links[0], 'gain2');
					gains.add(target);
				}
			}
			for (const target of game.filterPlayer((current) => !gains.includes(current)).sortBySeat()) {
				await target.chooseToUse();
			}
		},
	},

	Fe3O4_jinxiao: {
		trigger: {
			target: 'useCardToTargeted',
			player: 'useCardToPlayered',
		},
		filter(event, player) {
			if (event.player == event.target || event.targets.length != 1) {
				return false;
			}
			if (event.card.name != 'sha') {
				return false;
			}
			return event.player.countCards();
		},
		async cost(event, trigger, player) {
			event.result = await trigger.player
				.chooseToDiscard('he')
				.set('prompt', '矜骁 : 弃置一张牌,若为红色,此【杀】伤害+1')
				.set('onlychoose', true)
				.set('ai', (card) => {
					if (get.attitude(trigger.player, trigger.targets[0]) > 0) {
						return false;
					}
					if (get.color(card) == 'red') {
						return 8 - get.value(card);
					}
					return 6 - get.value(card);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			await trigger.player.discard(event.cards);
			if (get.color(event.cards) == 'red') {
				trigger.parent.baseDamage++;
			}
			const { result } = await trigger.player.discardPlayerCard(trigger.targets[0]);
			if (result?.bool && get.color(result.cards) == 'red') {
				await player.draw();
				trigger.directHit.addArray(game.players);
			}
		},
	},
	Fe3O4_danji: {
		limited: true,
		trigger: {
			player: 'phaseJieshuBegin',
		},
		check(event, player) {
			if (get.attitude(player, player.next) > 0) {
				return false;
			}
			return player.next.hp == 1 || !player.next.hasFriend();
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			const target = player.next;
			game.broadcastAll(
				function (target1, target2) {
					game.swapSeat(target1, target2);
				},
				player,
				target,
			);
			await player.useCard({ name: 'sha' }, false, target);
			if (
				game.getGlobalHistory('everything', (evt) => {
					if (evt.name != 'die' || evt.player != target) {
						return false;
					}
					return evt.getParent(5) == event;
				}).length
			) {
				player.restoreSkill(event.name);
			}
		},
	},

	Fe2O3_guanji: {
		trigger: {
			player: ['damageEnd', 'loseHpEnd', 'recoverEnd', 'loseAfter', 'drawAfter'],
			global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		filter(event, player, name) {
			if (player.countCards() != player.getHp()) {
				return false;
			}
			if (['damageEnd', 'loseHpEnd', 'recoverEnd', 'drawAfter'].includes(name)) {
				return true;
			}
			if (event.name == 'gain' && event.player == player) {
				return event.getg(player)?.hs?.length;
			}
			return event.getl(player)?.hs?.length;
		},
		usable: 1,
		async content(event, trigger, player) {
			await player.draw(2);
		},
	},
	Fe2O3_weixuan: {
		hiddenCard: (player, name) => name == 'tao' || name == 'zengbin',
		enable: 'chooseToUse',
		filter(event, player) {
			const filter = event.filterCard;
			return player.countCards('hes', (card) => {
				if (get.type(card) != 'equip') {
					return false;
				}
				if (get.color(card) == 'red') {
					if (!filter({ name: 'tao' }, player, event)) {
						return false;
					}
					return game.hasPlayer((current) => event.filterTarget({ name: 'tao' }, player, current) && current.hp <= 1);
				}
				if (get.color(card) == 'black') {
					if (!filter({ name: 'zengbin' }, player, event)) {
						return false;
					}
					return game.hasPlayer((current) => event.filterTarget({ name: 'zengbin' }, player, current) && current.countCards() <= 1);
				}
				return false;
			});
		},
		position: 'hes',
		filterCard(card, player, event) {
			event = event || _status.event;
			const filter = event._backup.filterCard;
			if (get.type(card) != 'equip') {
				return false;
			}
			if (get.color(card) == 'red') {
				if (!filter({ name: 'tao' }, player, event)) {
					return false;
				}
				return game.hasPlayer((current) => event.filterTarget({ name: 'tao' }, player, current) && current.hp <= 1);
			}
			if (get.color(card) == 'black') {
				if (!filter({ name: 'zengbin' }, player, event)) {
					return false;
				}
				return game.hasPlayer((current) => event.filterTarget({ name: 'zengbin' }, player, current) && current.countCards() <= 1);
			}
			return false;
		},
		viewAs: (cards) => ({
			name: get.color(cards) == 'red' ? 'tao' : 'zengbin',
		}),
		filterTarget(card, player, target) {
			const event = _status.event;
			const filter = event._backup.filterTarget;
			if (!ui.selected.targets.length && lib.filter.selectTarget()[0] != -1) {
				if (card.name == 'tao' && target.hp > 1) {
					return false;
				}
				if (card.name == 'zengbin' && target.countCards() > 1) {
					return false;
				}
			}
			return filter(card, player, target);
		},
		ai: {
			order: 12,
		},
	},

	Fe2O3_bayun: {
		get mod() {
			return lib.skill.ollongdan.mod;
		},
		hiddenCard: (player, name) => name == 'tao' || name == 'jiu',
		ai: {
			respondSha: true,
			respondShan: true,
			order(item, player) {
				if (player && _status.event.type == 'phase') {
					let max = 0;
					let list = ['sha', 'tao', 'jiu'];
					const map = { sha: 'shan', tao: 'jiu', jiu: 'tao' };
					for (let i = 0; i < list.length; i++) {
						let name = list[i];
						if (player.countCards('hs', map[name]) > (name == 'jiu' ? 1 : 0) && player.getUseValue({ name: name }) > 0) {
							let temp = get.order({ name: name });
							if (temp > max) {
								max = temp;
							}
						}
					}
					if (max > 0) {
						max += 0.3;
					}
					return max;
				}
				return 4;
			},
			result: {
				player: 1,
			},
		},
		enable: ['chooseToUse', 'chooseToRespond'],
		onChooseToUse(event) {
			const filter = (event._backup || event).filterCard;
			const filterTarget = (event._backup || event).filterTarget;
			const player = event.player;
			const useShan = (function () {
				if (filter({ name: 'sha' }, player, event)) {
					return false;
				}
				if (filter({ name: 'tao' }, player, event)) {
					return false;
				}
				if (filter({ name: 'jiu' }, player, event)) {
					return false;
				}
				if (!filter({ name: 'shan' }, player, event)) {
					return false;
				}
				return (event.respondTo || [])[0];
			})();
			if (useShan) {
				return void (event.Fe2O3_bayun_target = useShan);
			}
			if (event.type == 'dying' && event.dying) {
				return void (event.Fe2O3_bayun_target = event.dying);
			}
			event.Fe2O3_bayun_target = game.filterPlayer((target) => {
				if (player == target || !target.countGainableCards(player, 'he')) {
					return false;
				}
				if (filter({ name: 'sha' }, player, event) && filterTarget({ name: 'sha' }, player, target)) {
					return true;
				}
				if (filter({ name: 'sha' }, player, event) && filterTarget({ name: 'jiu' }, player, target)) {
					return true;
				}
				if (filter({ name: 'sha' }, player, event) && filterTarget({ name: 'tao' }, player, target)) {
					return true;
				}
				if (filter({ name: 'shan' }, player, event)) {
					return target == (event.respondTo || [])[0];
				}
				return false;
			});
		},
		onChooseToRespond(event) {
			event.Fe2O3_bayun_target = event.source || (event.respondTo || [])[0];
		},
		filter(event, player) {
			const filter = event.filterCard;
			if (event.Fe2O3_bayun) {
				player.tempBanSkill('Fe2O3_bayun');
			}
			if (filter({ name: 'sha' }, player, event)) {
				return true;
			}
			if (filter({ name: 'shan' }, player, event)) {
				return true;
			}
			if (filter({ name: 'tao' }, player, event)) {
				return true;
			}
			if (filter({ name: 'jiu' }, player, event)) {
				return true;
			}
			return false;
		},
		prompt(event) {
			const target = event.Fe2O3_bayun_target;
			if (get.itemtype(target) == 'player') {
				return `摸一张牌或获得${get.translation(target)}一张牌并发动${get.poptip('ollongdan')}或令此技能本回合失效`;
			}
			if (get.itemtype(target) == 'players') {
				return `摸一张牌或获得一名角色一张牌以发动${get.poptip('ollongdan')}(对其)使用一张牌或令此技能本回合失效`;
			}
			return `摸一张牌以发动${get.poptip('ollongdan')}或令此技能本回合失效`;
		},
		async precontent(event, trigger, player) {
			const target = event.parent.Fe2O3_bayun_target;
			if (get.itemtype(target) == 'player') {
				if (player == target || !target.countGainableCards(player, 'he')) {
					return;
				}
				const { bool } = await player
					.chooseBool(`获得${get.translation(target)}一张牌或取消摸一张牌`)
					.set('target', target)
					.set('ai', (event, player) => lib.card.shunshou_copy2.ai.result.target(player, get.event().target) > 0)
					.forResult();
				if (bool) {
					event.result.targets = [target];
				}
				return;
			}
			if (get.itemtype(target) == 'players') {
				const result = await player
					.chooseTarget('获得一名角色一张牌或取消摸一张牌')
					.set('ai', (target) => lib.card.shunshou_copy2.ai.result.target(get.player(), target))
					.set('targets', target)
					.set('filterTarget', (card, player, target) => get.event().targets.includes(target))
					.forResult();
				if (result.bool) {
					event.result.targets = result.targets;
				}
			}
		},
		async content(event, trigger, player) {
			const target = (event.targets || [])[0];
			if (target) {
				await player.gainPlayerCard(target, true);
			} else {
				await player.draw();
			}
			event.getParent(2).goto(0);
			event.getParent(2).Fe2O3_bayun = true;
			event.getParent(2).Fe2O3_bayun_longdan = target;
			player.addTempSkill('Fe2O3_bayun_1');
			event.getParent(2).backup('Fe2O3_bayun_longdan');
			event.getParent(2).openskilldialog = get.prompt2('ollongdan');
		},
		subSkill: {
			1: {
				charlotte: true,
			},
			longdan: {
				inherit: 'ollongdan',
				filterOk() {
					const event = get.event();
					const player = get.player();
					const target = event.Fe2O3_bayun_longdan;
					if (target) {
						if ((event.name == 'chooseToRespond' && event.source) || event.type == 'dying') {
							return true;
						}
						if (get.card().name == 'shan' && event.respondTo) {
							return target == event.respondTo[0];
						}
						return ui.selected.targets.includes(target);
					}
					return true;
				},
				async precontent(event, trigger, player) {
					player.removeSkill('Fe2O3_bayun_1');
				},
			},
		},
	},

	ddddssssbbbb_chouxuan: {
		forced: true,
		trigger: {
			player: 'useCard',
		},
		init(player, skill) {
			player.storage[skill] = {
				translate: lib.translate[skill + '_info'],
				str: '锁定技当你使用一张牌时若此牌与你上上家使用的上上张牌名相同你选择两项弃置一张牌并选择两项弃置一张牌并令此牌额外结算一次删除删除一个重复字符串摸X张牌删除一个重复字符串摸X张牌摸X张牌',
				num: 91,
			};
		},
		mark: true,
		intro: {
			content: (storage) => storage.str,
			markcount: (storage) => storage.num - storage.str.length,
		},
		filter(event, player) {
			const str = player.storage.ddddssssbbbb_chouxuan.str;
			let target = player.previous;
			if (str.includes('上上家')) {
				target = target.previous;
			}
			const history = target.getAllHistory('useCard', (evt) => evt != event);
			return history[history.length - 1 - str.includes('上上张')]?.card.name == event.card.name;
		},
		async content(event, trigger, player) {
			let links, first;
			const storage = player.storage[event.name];
			do {
				function update() {
					for (const i of list) {
						storage.translate = storage.translate.replaceAll(/(\d\.),*/g, (_, p1) => p1);
						storage.translate = storage.translate.replaceAll(/(\d\.)\d\./g, (_, p1) => p1);
						storage.translate = storage.translate.replaceAll(/,\d\../g, '');
						for (let i = 1; i < list.length; i++) {
							if (!storage.translate.includes(i + '.')) {
								for (let j = i; j < list.length + 1; j++) {
									if (storage.translate.includes(j + '.')) {
										storage.translate = storage.translate.replaceAll(j + '.', i + '.');
										break;
									}
								}
							}
						}
					}
					player.update(event.name);
				}
				let list = [...get.skillInfoTranslation(event.name, player).matchAll(/(?<=\d\.).*?(?=,\d\.|.)/g)];
				if (first) {
					list = list.filter((i) => !i[0].includes('选择两项'));
				}
				links = (await player.chooseButton(['筹旋:选择两项', ...list.map((i) => [i, 'textbutton'])], 2, true).forResult()).links;
				for (const link of links) {
					if (link.includes('弃置一张牌')) {
						await player.chooseToDiscard('he', true);
					}
					if (link.includes('令此牌额外结算一次')) {
						trigger.effectCount++;
					}
					if (/删除<.*?>/.test(link)) {
						const del = link.match(/删除<(.*?)>/)[1];
						storage.translate = storage.translate.replaceAll(del, '');
						storage.translate = storage.translate.replaceAll('<>', '');
						storage.str = storage.str.replaceAll(del, '');
						update();
					} else if (link.includes('删除一个重复字符串')) {
						let str = storage.str;
						const dblist = [];
						for (let i = 1; i < str.length / 2; i++) {
							for (let j = 0; j < str.length - i; j++) {
								if (str.slice(j, j + i) == str.slice(j + i, j + 2 * i)) {
									dblist.push(str.slice(j, j + i));
								}
							}
						}
						for (let i = 0; i < dblist.length; i++) {
							let j = dblist[i],
								k = dblist[i];
							const replace = `<a href='javascript:ui.selected.buttons.add({link : ${i}});ui.click.ok()'>${k}</a>`;
							if (str.includes(j + k)) {
								str = str.replace(j + k, j + replace);
							} else {
								do {
									j = j.slice(1);
									if (str.includes('</a>' + j + k)) {
										str = str.replace('</a>' + j + k, '</a>' + j + replace);
										break;
									}
								} while (j.length);
							}
						}
						const dialog = ui.create.dialog('hidden');
						dialog.add('删除一个重复字符串');
						dialog.addText(str);
						const index = (
							await player
								.chooseButton(dialog, true)
								.set('processAI', () => ({ bool: true, links: [0] }))
								.forResult()
						).links[0];
						str = str.replace(`<a href='javascript:ui.selected.buttons.add({link : ${index}});ui.click.ok()'>${dblist[index]}</a>`, '');
						str = str.replaceAll(/\d\.|<.*?>/g, '');
						storage.str = str;
						const strx = dblist[index],
							db = strx + strx;
						let i = 1;
						for (let j = 0; j < index; j++) {
							if (dblist[j] == strx) {
								i++;
							}
						}
						const translatexx = [];
						const translate = storage.translate;
						let num = 0,
							tempstr = '',
							temp = 0,
							temp2 = 0,
							start,
							end;
						for (let ii = 0; ii < translate.length; ii++) {
							if (/[\d\.,.:<>]/.test(translate[ii]) && temp) {
								tempstr += translate[ii];
								temp2++;
							} else if (translate[ii] == db[temp]) {
								if (temp == strx.length) {
									start = ii;
								}
								if (temp + 1 == db.length) {
									end = ii + 1;
								}
								tempstr += translate[ii];
								temp++;
							} else {
								tempstr = '';
								temp = 0;
								temp2 = 0;
								i -= temp + temp2;
							}
							if (temp == db.length) {
								num++;
							}
							if (num == i) {
								storage.translate = translate.slice(0, start) + translate.slice(end);
								break;
							}
						}
						update();
					}
					if (link.includes('删除,')) {
						const index = list.indexOf(link) + 1;
						storage.translate = storage.translate.replaceAll(link, '');
						storage.str = storage.str.replaceAll(link.replaceAll(',', ''), '');
						update();
					}
					if (link.includes('摸X张牌')) {
						const num = Math.floor((storage.num - storage.str.length) / 10) + 1;
						for (const i of link.matchAll(/摸X张牌/g)) {
							await player.draw(num);
						}
					}
				}
				first = true;
			} while (links.some((i) => i.includes('选择两项')));
		},
	},

	zxunnamed_huaiyi: {
		enable: 'phaseUse',
		usable: 1,
		derivation: ['zxunnamed_shixian'],
		init(player, skill) {
			player.storage[skill] = 0;
			player.storage[`${skill}_items`] = [];
		},
		zhuanhuanji(player, skill) {
			if (player.storage[skill] == player.storage[`${skill}_items`].length) {
				player.storage[skill] = 0;
			} else {
				player.storage[skill]++;
			}
		},
		mark: true,
		marktext: '异',
		$zhuanhuanji() { },
		intro: {
			markcount: (storage) => storage + 1,
			content(storage, player) {
				let list = [...get.skillInfoTranslation('zxunnamed_shixian', player).matchAll(/(?<=\d\.).*?(?=,\d\.|;)/g)];
				return `出牌阶段限一次,你可以${storage ? list[player.storage[`zxunnamed_huaiyi_items`][storage - 1]] : `弃置两张牌并获得或重置${get.poptip('zxunnamed_shixian')}`}`;
			},
		},
		filterCard: true,
		position: 'he',
		selectCard: () => (get.player().storage.zxunnamed_huaiyi == 0) * 2,
		async content(event, trigger, player) {
			const storage = player.storage[event.name];
			const items = player.storage[`${event.name}_items`];
			if (!storage) {
				if (player.hasSkill('zxunnamed_shixian')) {
					player.removeSkill('zxunnamed_shixian_used');
				} else {
					await player.addSkills('zxunnamed_shixian');
				}
			} else {
				await eval(`(async function () {${lib.skill.zxunnamed_shixian.choiceAfter[items[storage - 1]]}})()`);
			}
			player.changeZhuanhuanji(event.name);
		},
		ai: {
			order: 7,
			result: {
				player: 1,
			},
		},
	},
	zxunnamed_shixian: {
		trigger: {
			player: ['phaseJieshuBegin', 'damageEnd'],
			source: 'damageSource',
		},
		filter: (event, player, name) => !player.storage.zxunnamed_shixian_used?.trigger.includes(name),
		forced: true,
		choiceAfter: [
			'await player.draw(2)',
			'if (get.itemtype(_status.currentPhase) == `player`) await player.discardPlayerCard(_status.currentPhase)',
			`await player.removeSkills([event.name])
			let list = [...get.plainText(get.skillInfoTranslation(event.name, player)).matchAll(/(?<=\\d\\.).*?(?=,\\d\\.|;)/g)]
			console.log(list)
			for (const [i] of list)
				if (i == '摸两张牌') await player.draw(2)
				else if (i == '弃置当前回合角色一张牌') {
					if (get.itemtype(_status.currentPhase) == 'player')
						await player.discardPlayerCard(_status.currentPhase)
				}
				else if (i == '失去此技能并执行所有项') continue
				else {
					await player.chooseToDiscard('he', 2, true)
					if (player.hasSkill('zxunnamed_shixian')) player.removeSkill('zxunnamed_shixian_used')
					else await player.addSkills('zxunnamed_shixian')
				}`,
		],
		async content(event, trigger, player) {
			if (!player.hasSkill('zxunnamed_shixian_used')) {
				await player.addSkill('zxunnamed_shixian_used');
			}
			player.storage.zxunnamed_shixian_used.trigger.add(event.triggername);
			const chosen = player.storage.zxunnamed_shixian_used.chosen;
			let list = [...get.skillInfoTranslation(event.name, player).matchAll(/(?<=\d\.).*?(?=,\d\.|;)/g)];
			list = list.map((i, j) => [j, ...i]);
			const result = await player
				.chooseButton(['恃险:选择一项', [list, 'tdnodes']], true)
				.set('chosen', chosen)
				.set('filterButton', (button) => !get.event().chosen.includes(button.link))
				.forResult();
			game.log(player, '选择了', '#g【恃险】', '的', `#y选项${get.cnNumber(result.links[0] + 1, true)}`);
			chosen.add(result.links[0]);
			player.storage.zxunnamed_huaiyi_items?.push(result.links[0]);
			await eval(`(async function () {${lib.skill[event.name].choiceAfter[result.links[0]]}})()`);
		},
		onremove(player) {
			player.removeSkill('zxunnamed_shixian_used');
		},
		mark: true,
		marktext: '险',
		intro: {
			mark(dialog, storage, player) {
				const used = player.storage.zxunnamed_shixian_used || { trigger: [], chosen: [] };
				const addNewRow = lib.element.dialog.addNewRow.bind(dialog);
				const triggers = {
					phaseJieshuBegin: '结束阶段',
					damageSource: '造成伤害',
					damageEnd: '受到伤害',
				};
				const options = ['摸两张牌', '弃置牌', '失去技能'];
				dialog.css({ width: '35%' });
				used.trigger.forEach((i) => (triggers[i] = ''));
				used.chosen.forEach((i) => (options[i] = ''));
				const triggerx = Object.values(triggers);
				addNewRow(
					...[
						{ item: '时机', ratio: 2 },
						{ item: triggerx[0], ratio: 3 },
						{ item: triggerx[1], ratio: 3 },
						{ item: triggerx[2], ratio: 3 },
					],
				);
				addNewRow(
					...[
						{ item: '选项', ratio: 2 },
						{ item: options[0], ratio: 3 },
						{ item: options[1], ratio: 3 },
						{ item: options[2], ratio: 3 },
					],
				);
			},
		},
		subSkill: {
			used: {
				init(player, skill) {
					player.storage[skill] = {
						trigger: [],
						chosen: [],
					};
				},
			},
		},
	},

	FeO3_dafei: {
		trigger: {
			player: 'useCardToPlayered',
		},
		filter(event, player) {
			if (event.targets.length != 1) {
				return false;
			}
			const evt = player.getAllHistory('useCard', (evt) => evt != event.parent).lastItem;
			if (!evt) {
				return false;
			}
			if (evt.targets.length != 1) {
				return false;
			}
			const target = event.targets[0],
				targetx = evt.targets[0];
			if (target.hasSkill('undist') || targetx.hasSkill('undist')) {
				return false;
			}
			if (target.isDead() || targetx.isDead()) {
				return;
			}
			event.FeO3_dafei_target = targetx;
			let left = [],
				right = [],
				left2 = target.previous,
				right2 = target.next;
			while (left2 != targetx && right2 != targetx) {
				left.push(left2);
				right.push(right2);
				left2 = left2.previous;
				right2 = right2.next;
			}
			if (targetx == left2 && left.some((i) => i.countDiscardableCards(player, 'he'))) {
				return true;
			}
			if (targetx == right2 && right.some((i) => i.countDiscardableCards(player, 'he'))) {
				return true;
			}
			return false;
		},
		async cost(event, trigger, player) {
			const target = trigger.targets[0],
				targetx = trigger.FeO3_dafei_target;
			if (target.hasSkill('undist') || targetx.hasSkill('undist')) {
				return;
			}
			if (target.isDead() || targetx.isDead()) {
				return;
			}
			let left = [],
				right = [],
				left2 = target.previous,
				right2 = target.next,
				left_eff = 0,
				right_eff = 0;
			while (left2 != targetx && right2 != targetx) {
				left.push(left2);
				right.push(right2);
				left2 = left2.previous;
				right2 = right2.next;
			}
			const choices = [],
				cw = [],
				ccw = [];
			const card = { name: 'guohe_copy2' };
			if (targetx == right2) {
				for (const i of right) {
					if (i.countDiscardableCards(player, 'he')) {
						cw.add(i);
						right_eff += get.effect(i, card, player);
					}
				}
			}
			if (targetx == left2) {
				for (const i of left) {
					if (i.countDiscardableCards(player, 'he')) {
						ccw.add(i);
						left_eff += get.effect(i, card, player);
					}
				}
			}
			const dialog = ui.create.dialog(`###是否发动〖大飞〗###弃置${get.translation(targetx)}和${get.translation(target)}之间角色各一张牌`, 'hidden');
			const dialogs = {};
			for (const current of [...cw, ...ccw]) {
				const subdialog = ui.create.dialog('hidden');
				game.broadcastAll(
					function (event, subdialog) {
						if (event.isMine()) {
							subdialog.open();
						}
					},
					event,
					subdialog,
				);
				dialogs[current.playerid] = subdialog;
				subdialog.add(`弃置${get.translation(current)}一张牌`);
				let expand_length = 0;
				const hs = current.getDiscardableCards(player, 'h');
				expand_length += Math.ceil(hs.length / 6);
				if (hs.length) {
					const title = subdialog.add('<div class="text center" style="margin: 0px">手牌区</div>');
					title.style.margin = '0px';
					title.style.padding = '0px';
					hs.randomSort();
					if (current.isUnderControl(true) || player.hasSkillTag('viewHandcard', null, current, true)) {
						subdialog.add(hs);
					} else {
						const shown = hs.filter((card) => get.is.shownCard(card));
						if (shown.length) {
							const hidden = hs.filter((card) => !shown.includes(card));
							const buttons = ui.create.div('.buttons', subdialog.content);
							subdialog.buttons = subdialog.buttons.concat(ui.create.buttons(shown, 'card', buttons));
							subdialog.buttons = subdialog.buttons.concat(ui.create.buttons(hidden, 'blank', buttons));
							if (subdialog.buttons.length > 3) {
								subdialog.classList.remove('forcebutton-auto');
							} else {
								subdialog.classList.add('forcebutton-auto');
							}
						} else {
							subdialog.add([hs, 'blank']);
						}
						if (subdialog.buttons.length > 3) {
							subdialog.classList.remove('forcebutton-auto');
						} else {
							subdialog.classList.add('forcebutton-auto');
						}
					}
				}
				const es = current.getDiscardableCards(player, 'e');
				if (es.length) {
					expand_length += Math.ceil(es.length / 6);
					const title = subdialog.add('<div class="text center" style="margin: 0px">装备区</div>');
					title.style.margin = '0px';
					title.style.padding = '0px';
					subdialog.add(es);
				}
				if (expand_length > 2) {
					subdialog.classList.add('fullheight');
				}
			}
			dialog.buttons = Object.values(dialogs).reduce((buttons, dialog) => buttons.addArray(dialog.buttons), []);
			const result = await player
				.chooseButtonTarget({
					dialog,
					dialogs,
					filterTarget(card, player, target) {
						const { cw, cww } = get.event();
						if (!ui.selected.buttons.length) {
							return [...cw, ...ccw].includes(target);
						}
						const targetx = get.owner(get.links(ui.selected.buttons)[0]);
						return (cw.includes(target) && cw.includes(targetx)) || (ccw.includes(target) && ccw.includes(targetx));
					},
					selectButton: [0, Infinity],
					selectTarget: [0, Infinity],
					filterButton: (button) => get.owner(button.link) == ui.selected.targets[0] && ui.selected.buttons.every((buttonx) => get.owner(button.link) != get.owner(buttonx.link)),
					filterOk() {
						const { cw, cww } = get.event();
						if (cw.length && ui.selected.buttons.length == cw.length) {
							return true;
						}
						if (ccw.length && ui.selected.buttons.length == ccw.length) {
							return true;
						}
						return false;
					},
					cw,
					ccw,
					left_eff,
					right_eff,
					complexSelect: true,
					canHidden: false,
					processAI() {
						const event = get.event();
						const { player, left_eff, right_eff, ccw, cw, dialogs } = event;
						if (left_eff <= 0 && right_eff <= 0) {
							return { bool: false };
						}
						const links = [];
						if (right_eff > left_eff) {
							for (const target of cww) {
								const buttons = dialogs[target.playerid].buttons.slice();
								buttons.sort((a, b) => get.buttonValue(a) - get.buttonValue(b));
								if (get.attitude(player, target) > 0) {
									links.add(buttons[0].link);
								} else {
									links.add(buttons.lastItem.link);
								}
							}
						} else {
							for (const target of cw) {
								const buttons = dialogs[target.playerid].buttons.slice();
								buttons.sort((a, b) => get.buttonValue(a) - get.buttonValue(b));
								if (get.attitude(player, target) > 0) {
									links.add(buttons[0].link);
								} else {
									links.add(buttons.lastItem.link);
								}
							}
						}
						return { bool: true, links, targets: [] };
					},
					custom: {
						replace: {
							button(button) {
								const event = get.event();
								if (!event.isMine()) {
									return;
								}
								if (!button.classList.contains('selectable')) {
									return;
								}
								if (button.classList.contains('selected')) {
									button.classList.remove('selected');
									ui.selected.buttons.remove(button);
									get.owner(button.link).unprompt();
								} else {
									button.classList.add('selected');
									ui.selected.buttons.add(button);
									get.owner(button.link).prompt('已选择', 'water');
								}
								if (event.custom.add.button) {
									custom.add.button();
								}
								game.check();
							},
							target(target) {
								const event = get.event();
								const subdialog = event.dialogs[target.playerid];
								if (!target.classList.contains('selectable')) {
									return;
								}
								if (target.classList.contains('selected')) {
									ui.selected.targets.remove(target);
									target.classList.remove('selected');
									subdialog.hide();
									event.dialog.show();
								} else {
									ui.selected.targets.forEach((i) => i.classList.remove('selected'));
									ui.selected.targets = [target];
									target.classList.add('selected');
									Object.values(event.dialogs).forEach((dialog) => dialog.hide());
									event.dialog.hide();
									subdialog.show();
								}
								if (event.custom.add.target) {
									custom.add.target();
								}
								game.check();
							},
							window() {
								game.uncheck();
								const event = get.event();
								Object.values(event.dialogs).forEach((dialog) => dialog.hide());
								event.dialog.show();
								game.check();
							},
						},
						add: {},
					},
				})
				.forResult();
			Object.values(event.dialogs).forEach((dialog) => dialog.close());
			event.result = {
				bool: result.bool && result.links?.length,
				cost_data: result.links?.map((card) => [get.owner(card), [card]]),
			};
		},
		async content(event, trigger, player) {
			player.addTempSkill('FeO3_dafei_discarder');
			await game.loseAsync({ lose_list: event.cost_data }).setContent('discardMultiple');
		},
		subSkill: {
			discarder: {
				charlotte: true,
				forced: true,
				firstDo: true,
				trigger: {
					global: 'loseBefore',
				},
				filter: (event, player) => event.parent.name == 'loseAsync' && event.getParent(2).name == 'FeO3_dafei' && event.getParent(2).player == player,
				async content(event, trigger, player) {
					trigger.discarder = player;
				},
			},
		},
	},
	FeO3_zhengjie: {
		trigger: {
			player: 'loseAfter',
			global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		filter: (event, player) => event.getl(player)?.cards2.length,
		async cost(event, trigger, player) {
			event.result = await player.chooseUseTarget({ name: 'diaohulishan' });
		},
		popup: false,
		async content(event, trigger, player) { },
	},

	diaohulishan: {
		charlotte: true,
		group: 'undist',
		mod: {
			wuxieJudgeEnabled: () => false,
			wuxieEnabled: () => false,
			cardEnabled: () => false,
			cardUsable: () => false,
			cardSavable: () => false,
			targetEnabled: () => false,
		},
		trigger: {
			player: ['loseHpBefore', 'damageBefore', 'recoverBefore'],
		},
		firstDo: true,
		forced: true,
		async content(event, trigger, player) {
			trigger.cancel();
		},
	},
	FeO3_jinqi: {
		trigger: {
			global: 'dieAfter',
		},
		filter: () => get.discarded().someInD('d'),
		async content(event, trigger, player) {
			const cards = get.discarded().filterInD('d');
			if (cards.length) {
				const suits = [];
				for (const card of cards) {
					suits.add(card.suit);
				}
				const { result } = await player
					.chooseButton(['紧气:获得不同花色的牌各一张', cards], true, suits.length)
					.set('ai', (button) => {
						const player = get.player();
						return get.value(button.link, player);
					})
					.set('filterButton', (button) => get.links(ui.selected.buttons).every((card) => card.suit != button.link.suit));
				await player.gain(result.links, 'gain2');
			}
			for (const phase of lib.phaseName) {
				const evt = event.getParent(phase);
				if (evt && evt.name == phase) {
					evt.skipped = true;
					game.log(player, '令', _status.currentPhase, '结束了' + get.translation(phase));
					break;
				}
			}
			const evt2 = event.getParent('phase');
			if (evt2 && evt2.name == 'phase') {
				evt2.finish();
				game.log(player, '令', _status.currentPhase, '结束了当前回合');
			}
		},
	},

	Fe3O4_chichi: {
		enable: 'chooseToUse',
		viewAs(cards) {
			if (cards.length) {
				return cards[0];
			}
			return null;
		},
		position: 'h',
		zhuanhuanji: true,
		mark: true,
		marktext: '☯',
		intro: {
			content(storage) {
				if (storage == true) {
					return '你可以以明置方式使用牌';
				}
				return '你可以以重铸方式使用牌';
			},
		},
		filterCard(card, player, event) {
			event ??= get.event();
			if (!event._backup.filterCard(card, player, event)) {
				return false;
			}
			if (player.storage.Fe3O4_chichi) {
				return player.canRecast(card);
			}
			return !get.is.shownCard(card);
		},

		forced: true,
		onChooseToUse(event) {
			const player = get.player();
			if (lib.config.autoskilllist.includes('Fe3O4_chichi')) {
				return;
			}
			let skills = player.getSkills('invisible');
			skills = game
				.expandSkills(skills)
				.concat(lib.skill.global)
				.filter((skill) => lib.filter.filterEnable(event, player, skill));
			skills.remove('Fe3O4_chichi');
			if (skills.length) {
				return;
			}
			if (event.type != 'phase') {
				return;
			}
			if (!event.isMine()) {
				return;
			}
			if (event.norestore || event._backup || event.skill) {
				return;
			}
			event.fakeforce = true;
			event.backup('Fe3O4_chichi');
			event.openskilldialog = ui.create.dialog(get.translation('Fe3O4_chichi'), '<div><div style="width:100%">' + lib.dynamicTranslate['Fe3O4_chichi'](player, 'Fe3O4_chichi') + '</div></div>');
		},
		async precontent(event, trigger, player) {
			let next;
			if (player.storage.Fe3O4_chichi) {
				next = player.recast(event.result.cards.slice());
			} else {
				next = player.addShownCards(event.result.cards.slice(), 'visible_Fe3O4_chichi');
			}
			player.changeZhuanhuanji('Fe3O4_chichi');
			await next;
			event.parent.Fe3O4_chichi = event.result.cards.slice();
			player.addTempSkill('Fe3O4_chichi_nolose');
		},
		ai: {
			order: 7,
			result: {
				player: 1,
			},
		},
		subSkill: {
			nolose: {
				charlotte: true,
				forced: true,
				firstDo: true,
				trigger: {
					global: ['cardsGotoOrderingBefore', 'loseBefore'],
				},
				filter: (event) => event.parent.name == 'useCard' && event.getParent(2).Fe3O4_chichi,
				async content(event, trigger, player) {
					trigger.cards.removeArray(trigger.getParent(2).Fe3O4_chichi);
				},
			},
		},
	},
	Fe2O3_chichi: {
		mod: {
			cardEnabled(card, player) {
				if (card.cards) {
					for (const i of card.cards) {
						if (lib.skill.Fe2O3_chichi.mod.cardEnabled(i, player) === false) {
							return false;
						}
					}
					return;
				}
				if (!player.getCards().includes(card)) {
					return;
				}
				for (let i of player.getCards()) {
					if (get.is.shownCard(i)) {
						return false;
					}
					if (i == card) {
						return;
					}
				}
			},
			get cardSavable() {
				return lib.skill.Fe2O3_chichi.mod.cardEnabled;
			},
			get cardRespondable() {
				return lib.skill.Fe2O3_chichi.mod.cardEnabled;
			},
			ignoredHandcard(card, player) {
				for (let i of player.getCards()) {
					if (get.is.shownCard(i)) {
						return true;
					}
					if (i == card) {
						return;
					}
				}
			},
			cardDiscardable(card, player, name) {
				if (!player.getCards().includes(card)) {
					return;
				}
				if (name == 'phaseDiscard') {
					for (let i of player.getCards()) {
						if (get.is.shownCard(i)) {
							return false;
						}
						if (i == card) {
							return;
						}
					}
				}
			},
			get wuxieJudgeEnabled() {
				return lib.skill.Fe2O3_chichi.mod.cardDiscardable;
			},
			get wuxieEnabled() {
				return lib.skill.Fe2O3_chichi.mod.cardDiscardable;
			},
		},
		forced: true,
		trigger: {
			player: 'recastBegin',
		},
		filter: (event, player) =>
			player.countCards('he', (card) => {
				if (card.suit == 'none') {
					return false;
				}
				if (event.cards.includes(card)) {
					return false;
				}
				if (event.cards.every((i) => i.suit != card.suit)) {
					return false;
				}
				return player.canRecast(card);
			}),
		async content(event, trigger, player) {
			const suits = [],
				cards = trigger.cards;
			for (const card of cards) {
				suits.add(card.suit);
			}
			suits.remove('none');
			for (const suit of suits) {
				cards.addArray(player.getCards('he', (card) => card.suit == suit && player.canRecast(card)));
			}
		},
		ai: {
			noSortCard: true,
			neg: true,
		},
	},

	ybsl_jianyue: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'judgeEnd',
		},
		preHidden: true,
		check(event, player) {
			return player.hasUseTarget(event.result.card);
		},
		filter(event, player) {
			return get.position(event.result.card, true) == 'o' && player.hasUseTarget(event.result.card);
		},
		async content(event, trigger, player) {
			player.chooseUseTarget(trigger.result.card, false);
		},
	},
	ybsl_tuntian: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'loseAfter',
			global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		forced: true,
		preHidden: true,
		filter(event, player) {
			if (player == _status.currentPhase) {
				return false;
			}
			if (event.name == 'gain' && event.player == player) {
				return false;
			}
			let evt = event.getl(player);
			return evt && evt.cards2 && evt.cards2.length;
		},
		content: async function (event, trigger, player) {
			let result = await player
				.judge(function (card) {
					if (card.suit == 'heart') {
						return -1;
					}
					return 1;
				})
				.set('judge2', function (result) {
					return result.bool;
				})
				.forResult();
			if (!result.bool || get.position(result.card) != 'd') {
				event.finish();
				return;
			} else {
				let card = result.card;
				let next = await player
					.chooseBool('是否将' + get.translation(card) + '作为<田>置于武将牌上？')
					.set('ai', function () {
						return true;
					})
					.forResult();
				if (!next.bool && !event.directbool) {
					return;
				} else {
					await player.addToExpansion(card, 'gain2').gaintag.add('tuntian');
				}
			}
		},

		marktext: '田',
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
		group: 'ybsl_tuntian_dist',
		subSkill: {
			dist: {
				mod: {
					globalFrom(from, to, distance) {
						let num = distance - from.getExpansions('tuntian').length;
						if (_status.event.skill == 'jixi_backup' || _status.event.skill == 'gzjixi_backup') {
							num++;
						}
						return num;
					},
				},
			},
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (
						typeof card === 'object' &&
						card.name === 'sha' &&
						target.mayHaveShan(
							player,
							'use',
							target.getCards('h', (i) => {
								return i.hasGaintag('sha_notshan');
							}),
						)
					) {
						return [0.6, 0.75];
					}
					if (!target.hasFriend() && !player.hasUnknown()) {
						return;
					}
					if (_status.currentPhase == target || get.type(card) === 'delay') {
						return;
					}
					if (card.name != 'shuiyanqijunx' && get.tag(card, 'loseCard') && target.countCards('he')) {
						if (target.hasSkill('ziliang')) {
							return 0.7;
						}
						return [0.5, Math.max(2, target.countCards('h'))];
					}
					if (target.isUnderControl(true, player)) {
						if ((get.tag(card, 'respondSha') && target.countCards('h', 'sha')) || (get.tag(card, 'respondShan') && target.countCards('h', 'shan'))) {
							if (target.hasSkill('ziliang')) {
								return 0.7;
							}
							return [0.5, 1];
						}
					} else if (get.tag(card, 'respondSha') || get.tag(card, 'respondShan')) {
						if (get.attitude(player, target) > 0 && card.name == 'juedou') {
							return;
						}
						if (get.tag(card, 'damage') && target.hasSkillTag('maixie')) {
							return;
						}
						if (target.countCards('h') == 0) {
							return 2;
						}
						if (target.hasSkill('ziliang')) {
							return 0.7;
						}
						if (get.mode() == 'guozhan') {
							return 0.5;
						}
						return [0.5, Math.max(target.countCards('h') / 4, target.countCards('h', 'sha') + target.countCards('h', 'shan'))];
					}
				},
			},
			threaten(player, target) {
				if (target.countCards('h') == 0) {
					return 2;
				}
				return 0.5;
			},
			nod,
		},
	},
	ybsl_quanfan: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return (
				(player.getExpansions('tuntian').length || player.countDiscardableCards(player, 'he')) &&
				game.countPlayer(function (current) {
					return current != player && get.attitude(player, current) < 0;
				}) > 0
			);
		},
		check(card) {
			return 8 - get.value(card);
		},
		chooseButton: {
			dialog(event, player) {
				const dialog = ui.create.dialog('请选择一张手牌或田');
				if (player.countDiscardableCards(player, 'he')) {
					dialog.add('手牌');
					dialog.add(player.getCards('h'));
				}
				if (player.getExpansions('tuntian').length) {
					dialog.add('田');
					dialog.add(player.getExpansions('tuntian'));
				}
				return dialog;
			},
			backup(links, player) {
				return {
					audio: 'ybsl_quanfan',
					filterTarget: false,
					filterCard() {
						return false;
					},
					selectCard: -1,
					card: links[0],
					delay: false,
					content: lib.skill.ybsl_quanfan.contentx,
					ai: {
						order: 10,
						result: {
							target(player, target) {
								return -2;
							},
						},
					},
				};
			},
		},
		contentx() {
			'step 0';
			const vard = lib.skill.ybsl_quanfan_backup.card;
			player.discard(vard);
			('step 1');
			let next = player.judge(function (card) {
				if (card.suit == 'heart') {
					return -1;
				}
				return 1;
			});
			next.judge2 = function (result) {
				return result.bool;
			};
			('step 2');
			event.card = result.card;
			if (game.filterPlayer().filter((tar) => tar != player && tar.countCards('h'))) {
				player
					.chooseTarget('展示一名其他角色的至多Y张手牌(Y为其体力值且至多为5),弃置其中与判定颜色相同的牌', true, function (card, player, target) {
						return target.countCards('h') && target != player;
					})
					.set('ai', function (target) {
						return -get.attitude(_status.event.player, target);
					});
			} else {
				event.finish();
			}
			('step 3');
			if (result.bool) {
				delete result.cards;
				event.target = result.targets[0];
				player.choosePlayerCard(event.target, 'h', [1, Math.min(event.target.countCards('he'), 5, event.target.hp)], '展示一名其他角色的至多Y张手牌(Y为其体力值且至多为5),弃置其中与判定花色相同的牌').set('forceAuto', true);
			} else {
				event.finish();
			}
			('step 4');
			if (result.bool) {
				let cards = result.cards,
					cards2 = [];
				event.target.showCards(cards);
				for (let i = 0; i < cards.length; i++) {
					if (cards[i].suit == event.card.suit) {
						cards2.push(cards[i]);
					}
				}
				event.target.discard(cards2);
			}
		},
		ai: {
			order: 9,
			result: {
				player: 1,
			},
			threaten: 2,
		},
	},

	ybsl_quanbian: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCardAfter',
		},

		filter(event, player) {
			return player.isPhaseUsing();
		},
		content() {
			'step 0';
			const suit1 = trigger.card.suit;
			const suits = get.YB_suit(
				player.getHistory('useCard', function (evt) {
					return evt.card != trigger;
				}),
			);
			if (suits.includes(suit1)) {
				player.loseHp();
				player.markSkill('ybsl_quanbian_mark');
				player.addTempSkill('ybsl_quanbian_mark', 'phaseUseAfter');
				if (!player.storage.ybsl_quanbian_markR) {
					player.storage.ybsl_quanbian_markR = 0;
				}
				player.storage.ybsl_quanbian_markR++;
			} else {
				player.chooseControl('是', '否').set('prompt', '是否摸牌？');
			}

			('step 1');
			if (result.control == '是') {
			}
		},
		subSkill: {
			mark: {
				mark: true,
				marktext: '辩',
				intro: {
					name: '权辩',
					content(event, player, storage, name, skill) {
						let text = '';

						if (player.storage.ybsl_quanbian_markR) {
							text += '本阶段因此技能增加攻击范围' + player.storage.ybsl_quanbian_markR;
						}
					},
				},
				mod: {
					attackRange(player, distance) {
						return distance + player.storage.ybsl_quanbian_markR;
					},
				},
				init(player) {
					if (!player.storage.ybsl_quanbian_markR) {
						player.storage.ybsl_quanbian_markR = 0;
					}
				},
				forced: true,
				onremove(player) {
					delete player.storage.ybsl_quanbian_markR;
				},
			},
		},
	},
	ybsl_quanbianx: {
		audio: 'ybsl_quanbian',
		trigger: {
			player: 'useCardAfter',
		},

		filter(event, player) {
			return player.isPhaseUsing();
		},
		content() {
			'step 0';
			if (!player.storage.ybsl_quanbianx_mark) {
				player.storage.ybsl_quanbianx_mark = [];
			}
			const suit1 = trigger.card.suit;
			const suits = player.storage.ybsl_quanbianx_mark;
			if (suits.includes(suit1)) {
				player.loseHp();

				if (!player.storage.ybsl_quanbianx_markR) {
					player.storage.ybsl_quanbianx_markR = 0;
				}
				player.storage.ybsl_quanbianx_markR++;
			} else {
				player.chooseControl('是', '否').set('prompt', '是否摸牌？');
			}

			('step 1');
			if (result.control == '是') {
				player.draw();
				player.markSkill('ybsl_quanbianx_mark');
				player.addTempSkill('ybsl_quanbianx_mark', 'phaseUseAfter');

				player.storage.ybsl_quanbianx_mark.push(trigger.card.suit);
			}
		},
		subSkill: {
			mark: {
				mark: true,
				marktext: '辩',
				intro: {
					name: '权辩',
					content(event, player, storage, name, skill) {
						let text = '';
						if (player.storage.ybsl_quanbianx_mark) {
							text += '本阶段已因' + player.storage.ybsl_quanbianx_mark + '触发过技能';
						}
						if (player.storage.ybsl_quanbianx_markR) {
							text += '<br>本阶段因此技能增加攻击范围' + player.storage.ybsl_quanbianx_markR;
						}
						return text;
					},
				},

				init(player) {
					if (!player.storage.ybsl_quanbianx_mark) {
						player.storage.ybsl_quanbianx_mark = [];
					}
					if (!player.storage.ybsl_quanbianx_markR) {
						player.storage.ybsl_quanbianx_markR = 0;
					}
				},

				forced: true,
				mod: {
					attackRange(player, distance) {
						return distance + player.storage.ybsl_quanbianx_markR;
					},
				},
				onremove(player) {
					delete player.storage.ybsl_quanbianx_mark;
					delete player.storage.ybsl_quanbianx_markR;
				},
			},
		},
	},
	ybsl_zhaxiang: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	ybsl_ranxin: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseEnd',
		},
		filter(event, player) {
			if (!_status.currentPhase || !_status.currentPhase.isIn()) {
				return false;
			}
			if (event.player == player) {
				return true;
			}
			if (event.player.getHistory('skipped').length) {
				return true;
			}
			let list = game.filterPlayer();
			for (const i of list) {
				if (i.hasSkill('YB_damageCancel2')) {
					return i.isIn();
				}
			}
		},

		forced: true,
		content: async function (event, trigger, player) {
			let target = trigger.player;
			let result = await player
				.chooseControl()
				.set('prompt', '燃心:请选择一项,然后视为对其使用一张伤害+1的火【杀】')
				.set('choiceList', ['令' + get.translation(trigger.player) + '回复1点体力', '令' + get.translation(trigger.player) + '摸两张牌', '取消'])
				.set('ai', function () {
					let target = trigger.player;
					if (
						get.effect(
							_status.event.getTrigger().player,
							{
								name: 'sha',
								nature: 'fire',
							},
							_status.event.player,
						) > 0
					) {
						if (target.maxHp >= target.hp && !target.hasSkillTag('maixie')) {
							return 0;
						}
						return 2;
					} else {
						if (get.attitude(player, target) > 0) {
							if (target.hasSkill('xiangle')) {
								if (target.hp <= 1 && target.maxHp - target.hp >= 1) {
									return 0;
								} else {
									return 1;
								}
							} else if (target.hasShan()) {
								if (target.hp <= 1 && target.maxHp - target.hp >= 1) {
									return 0;
								} else {
									return 1;
								}
							}
						}
					}
					return 2;
				})
				.forResult();

			if (result.index != 2) {
				await player.logSkill('ybsl_ranxin', target);
				if (result.index == 0) {
					await target.recover();
				} else {
					await target.draw(2);
				}

				if (player != target) {
					await player.useCard(
						{
							name: 'sha',
							nature: 'fire',
							ybdamage: true,
						},
						target,
					);
				}
			}
		},
		group: 'ybsl_ranxin_damage',
		subSkill: {
			damage: {
				forced: true,
				trigger: {
					source: 'damageBegin1',
				},
				filter(event, player) {
					if (event.card && event.card.ybdamage) {
						return true;
					}
				},
				content() {
					trigger.num++;
				},
			},
		},
	},
	ybsl_fuju: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,

		trigger: {
			target: 'rewriteGainResult',
			player: 'damageBegin3',
		},
		filter(event, player, name) {
			if (name == 'rewriteGainResult') {
				return event.player != player;
			} else {
				return event.source != player;
			}
		},
		content() {
			'step 0';
			trigger.cancel();
			if (event.triggername == 'rewriteGainResult') {
				player.discard(trigger.cards);
				event.target = trigger.player;
			} else {
				player.loseHp();
				event.target = trigger.source;
			}
			('step 1');
			if (target.hp > player.hp) {
				target.damage(player);
			}
			('step 2');
			if (target.countCards('h') > player.countCards('h') && target.countDiscardableCards(player, 'he')) {
				player.discardPlayerCard('he', target, true);
			}
		},
	},
	ybsl_ranxinx: {
		audio: 'ybsl_ranxin',
		trigger: {
			global: 'phaseEnd',
		},
		filter(event, player) {
			if (!_status.currentPhase || !_status.currentPhase.isIn()) {
				return false;
			}
			if (event.player == player) {
				return true;
			}
			if (event.player.getHistory('skipped').length) {
				return true;
			}
			let list = game.filterPlayer();
			for (const i of list) {
				if (i.hasSkill('YB_damageCancel2') || i.hasSkill('YB_excludedCancel2')) {
					return i.isIn();
				}
			}
		},
		forced: true,
		content: async function (event, trigger, player) {
			let target = trigger.player;
			let result = await player
				.chooseControl()
				.set('prompt', '燃心:请选择一项,然后视为对其使用一张伤害+1的火【杀】')
				.set('choiceList', ['令' + get.translation(trigger.player) + '回复1点体力', '令' + get.translation(trigger.player) + '摸两张牌', '取消'])
				.set('ai', function () {
					let target = trigger.player;
					if (
						get.effect(
							_status.event.getTrigger().player,
							{
								name: 'sha',
								nature: 'fire',
							},
							_status.event.player,
						) > 0
					) {
						if (target.maxHp >= target.hp && !target.hasSkillTag('maixie')) {
							return 0;
						}
						return 2;
					} else {
						if (get.attitude(player, target) > 0) {
							if (target.hasSkill('xiangle')) {
								if (target.hp <= 1 && target.maxHp - target.hp >= 1) {
									return 0;
								} else {
									return 1;
								}
							} else if (target.hasShan()) {
								if (target.hp <= 1 && target.maxHp - target.hp >= 1) {
									return 0;
								} else {
									return 1;
								}
							}
						}
					}
					return 2;
				})
				.forResult();
			if (result.index != 2) {
				await player.logSkill('ybsl_ranxin', target);
				if (result.index == 0) {
					await target.recover();
				} else {
					await target.draw(2);
				}
				if (player != target) {
					await player.useCard(
						{
							name: 'sha',
							nature: 'fire',
							ybdamage: true,
						},
						target,
					);
				}
			}
		},
		group: 'ybsl_ranxin_damage',
		subSkill: {
			damage: {
				forced: true,
				trigger: {
					source: 'damageBegin1',
				},
				filter(event, player) {
					if (event.card && event.card.ybdamage) {
						return true;
					}
				},
				content() {
					trigger.num++;
				},
			},
		},
	},
	ybsl_ranxiny: {
		audio: 'ybsl_ranxin',
		trigger: {
			global: 'phaseEnd',
		},
		filter(event, player) {
			if (!_status.currentPhase || !_status.currentPhase.isIn()) {
				return false;
			}

			if (event.player.getHistory('skipped').length) {
				return true;
			}

			return _status.currentPhase.hasHistory('lose', function (evt) {
				return evt.type == 'discard' && evt.cards2.length;
			});
		},
		forced: true,
		content: async function (event, trigger, player) {
			let target = trigger.player;
			if (
				event.player.getHistory('skipped').length &&
				_status.currentPhase.hasHistory('lose', function (evt) {
					return evt.type == 'discard' && evt.cards2.length;
				})
			) {
				let result = await player
					.chooseControl()
					.set('prompt', '燃心:请选择一项,然后视为对其使用一张伤害+1的火【杀】')
					.set('choiceList', ['令' + get.translation(trigger.player) + '回复1点体力', '令' + get.translation(trigger.player) + '摸两张牌', '令' + get.translation(trigger.player) + '回复1点体力,然后令' + get.translation(trigger.player) + '摸两张牌', '取消'])
					.set('ai', function () {
						let target = trigger.player;
						if (
							get.effect(
								_status.event.getTrigger().player,
								{
									name: 'sha',
									nature: 'fire',
								},
								_status.event.player,
							) > 0
						) {
							if (target.maxHp >= target.hp && !target.hasSkillTag('maixie')) {
								return 0;
							}
							return 3;
						} else {
							if (get.attitude(player, target) > 0) {
								return 2;
							}
						}
						return 2;
					})
					.forResult();
				if (result.index != 3) {
					await player.logSkill('ybsl_ranxin', target);
					if (result.index == 0 || result.index == 2) {
						await target.recover();
					}
					if (result.index == 1 || result.index == 2) {
						await target.draw(2);
					}
					if (player != target) {
						await player.useCard(
							{
								name: 'sha',
								nature: 'fire',
								ybdamage: true,
							},
							target,
						);
					}
				}
			} else {
				let result = await player
					.chooseControl()
					.set('prompt', '燃心:请选择一项,然后视为对其使用一张伤害+1的火【杀】')
					.set('choiceList', ['令' + get.translation(trigger.player) + '回复1点体力', '令' + get.translation(trigger.player) + '摸两张牌', '取消'])
					.set('ai', function () {
						let target = trigger.player;
						if (
							get.effect(
								_status.event.getTrigger().player,
								{
									name: 'sha',
									nature: 'fire',
								},
								_status.event.player,
							) > 0
						) {
							if (target.maxHp >= target.hp && !target.hasSkillTag('maixie')) {
								return 0;
							}
							return 2;
						} else {
							if (get.attitude(player, target) > 0) {
								if (target.hasSkill('xiangle')) {
									if (target.hp <= 1 && target.maxHp - target.hp >= 1) {
										return 0;
									} else {
										return 1;
									}
								} else if (target.hasShan()) {
									if (target.hp <= 1 && target.maxHp - target.hp >= 1) {
										return 0;
									} else {
										return 1;
									}
								}
							}
						}
						return 2;
					})
					.forResult();
				if (result.index != 2) {
					await player.logSkill('ybsl_ranxin', target);
					if (result.index == 0) {
						await target.recover();
					} else {
						await target.draw(2);
					}
					if (player != target) {
						await player.useCard(
							{
								name: 'sha',
								nature: 'fire',
								ybdamage: true,
							},
							target,
						);
					}
				}
			}
		},
		group: 'ybsl_ranxin_damage',
		subSkill: {
			damage: {
				forced: true,
				trigger: {
					source: 'damageBegin1',
				},
				filter(event, player) {
					if (event.card && event.card.ybdamage) {
						return true;
					}
				},
				content() {
					trigger.num++;
				},
			},
		},
	},

	ybsl_rongjie: {
		audio: 'mbganjue',
		usable: 1,
		trigger: {
			player: 'useCardToTargeted',
			target: 'useCardToTargeted',
		},
		filter(event, player) {
			if (!get.tag(event.card, 'damage')) {
				return false;
			}
			if (event.player == player) {
				return event.targets.length == 1 && event.target != player;
			}
			return true;
		},
		content() {
			'step 0';
			const targetx = trigger.player == player ? trigger.target : trigger.player;
			event.list = [player, targetx];
			event.list2 = [];
			event.count = 0;
			('step 1');
			event.source = event.list[event.count];
			event.target = event.list[1 - event.count];
			const list66 = get.YB_pu1(event.source);
			if (list66.length) {
				event.source.YB_control(list66, 8, '请选择一个出限一技能发动,选错了不能取消');
			} else {
				event._result = false;
				event.goto(3);
			}
			('step 2');
			if (result.control && result.control != 'cancel2') {
				if (!event.source.getStat('skill')[result.control]) {
					event.source.getStat('skill')[result.control] = 0;
				}
				event.source.getStat('skill')[result.control]--;
				event.skillName = result.control;

				let next = event.source.chooseToUse();
				next.set('openskilldialog', get.prompt(event.skillName));
				next.set('norestore', true);
				next.set('_backupevent', event.skillName);
				next.set('custom', {
					add: {},
					replace: {
						window() { },
					},
				});

				next._triggered = null;
				next.backup(event.skillName);
			}
			('step 3');

			if (!result.bool) {
				event.source.getStat('skill')[event.skillname]++;
				if (event.source.countGainableCards(event.target, 'h')) {
					event.target
						.gainPlayerCard('h', event.source, true)
						.set('target', event.source)
						.set('complexSelect', false)
						.set('ai', (button) => {
							let val = get.buttonValue(button);
							if (get.event().att > 0) {
								return 1 - val;
							}
							return val;
						})
						.set('att', get.attitude(event.target, event.source));
				}
			} else {
				event.list2.push(event.source);
			}
			('step 4');
			event.count++;
			('step 5');
			if (event.count < 2) {
				event.goto(1);
			} else {
				if (event.list2.length >= 2) {
					trigger.parent.excluded.add(trigger.target);
				}
			}
		},
	},
	ybsl_xiangcha: {
		audio: 'mbzhuji',
		logAudio(event, player) {
			if (player.storage.ybsl_xiangcha == true) {
				return ['mbzhuji2.mp3'];
			}
			return ['mbzhuji1.mp3'];
		},
		usable: 1,
		enable: 'phaseUse',
		zhuanhuanji: true,
		mark: true,
		marktext: '☯',

		intro: {
			content(storage, player, skill) {
				if (player.storage[skill] == true) {
					return '转换技,出牌阶段限一次,<span class="bluetext">阳:你可以将一张红色牌当【洞烛先机】使用</span>;阴,你可以将一张黑色牌当【知己知彼】.若因此观看到了与本次使用牌相同颜色的牌,你可以展示之,令你本回合下次造成的伤害+1';
				}
				return '转换技,出牌阶段限一次,阳:你可以将一张红色牌当【洞烛先机】使用;<span class="bluetext">阴,你可以将一张黑色牌当【知己知彼】</span>.若因此观看到了与本次使用牌相同颜色的牌,你可以展示之,令你本回合下次造成的伤害+1';
			},
		},
		viewAs(cards, player) {
			const storage = player.storage.ybsl_xiangcha;
			let name = storage == true ? 'dongzhuxianji' : 'ybsl_zhijizhibi';
			return { name: name, ybsl_xiangcha: true };
		},
		check(card) {
			const player = _status.event.player;
			const storage = player.storage.ybsl_xiangcha;
			let name = storage == true ? 'dongzhuxianji' : 'ybsl_zhijizhibi';
			return (get.value({ name: name }, player) + 6 - get.value(card)) * 2;
		},
		position: 'hes',
		filterCard(card, player) {
			const storage = player.storage.ybsl_xiangcha;
			return get.color(card) == (storage == true ? 'red' : 'black');
		},
		prompt() {
			const storage = _status.event.player.storage.ybsl_xiangcha;
			if (storage == true) {
				return '将一张红色牌当【洞烛先机】使用';
			}
			return '将一张黑色牌当【知己知彼】使用';
		},
		precontent() {
			'step 0';
			const skill = 'ybsl_xiangcha';

			player.changeZhuanhuanji(skill);
		},
		group: 'ybsl_xiangcha_watch',
		subSkill: {
			watch: {
				audio: 'ybsl_xiangcha',
				trigger: {
					player: ['chooseToGuanxingAfter', 'chooseControlAfter'],
				},
				logAudio(event, player, name) {
					return ['mbzhuji3.mp3'];
				},
				filter(event, player, name) {
					if (event.getParent(1).card && event.getParent(1).card.ybsl_xiangcha) {
						return true;
					}
					return false;
				},
				async cost(event, trigger, player) {
					if (event.triggername == 'chooseToGuanxingAfter') {
						const cards1 = trigger.result.moved[0];
						const cards2 = trigger.result.moved[1];
						let cards = cards1.concat(cards2);
					} else {
						if (trigger.dialog) {
							const dialog = trigger.dialog;
						}
						if (dialog) {
							const cardsxx = dialog.buttons;
							let cards = [];
							for (let j of cardsxx) {
								cards.push(j.link);
							}
						}
					}
					if (cards) {
						const { bool, links } = await player
							.chooseButton(['详查:请选择欲展示之牌', cards], [1, cards.length])
							.set('ai', function (button) {
								return true;
							})
							.set('filterButton', function (button) {
								let card = trigger.getParent(1).card;
								return get.color(button.link) == get.color(card);
							})
							.forResult();
						event.result = {
							bool: bool,
							cost_data: links,
						};
					}
				},
				content() {
					player.showCards(event.cost_data);
					player.YB_tempx('ybsl_xiangcha_damage', event.cost_data.length);
				},
			},
			damage: {
				audio: 'ybsl_xiangcha',
				logAudio(event, player, name) {
					return ['mbzhuji4.mp3'];
				},
				charlotte: true,
				forced: true,
				mark: true,
				intro: {
					content: '本回合下次伤害+$',
				},
				trigger: {
					source: 'damageBegin1',
				},
				filter: (event, player) => player.countMark('ybsl_xiangcha_damage') > 0,
				content() {
					const num = player.countMark('ybsl_xiangcha_damage');
					player.removeMark('ybsl_xiangcha_damage', num);
					trigger.num += num;
				},
			},
		},
	},

	ybsl_xijian: {
		audio: 'ext:夜白神略/audio/character:2',
		mark: true,
		limited: true,
		init(player) {
			player.storage.ybsl_xijian = false;
		},
		trigger: {
			global: ['dyingAfter'],
		},
		filter(event, player) {
			return event.player.isIn() && event.player.hp > 0;
		},
		async content(event, trigger, player) {
			player.awakenSkill('ybsl_xijian');
			player.storage.ybsl_xijian = true;
			await trigger.player.loseHp(trigger.player.hp);
		},
	},
	ybsl_shilu: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	ybsl_qingguo: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	ybsl_yedun: {
		derivation: ['olshilu'],
		audio: 'ext:夜白神略/audio/character:2',

		init(player) {
			if (!player.storage.ybsl_yedun) {
				player.storage.ybsl_yedun = [];
			}
		},
		trigger: { player: 'damageEnd' },
		filter(event, player) {
			return player.getHistory('damage').indexOf(event) == 0;
		},
		async cost(event, trigger, player) {
			if (!player.storage.ybsl_yedun) {
				player.storage.ybsl_yedun = [];
			}
			if (game.countPlayer((c) => !player.storage.ybsl_yedun.includes(c) && player != c) > 0) {
				event.result = await player
					.chooseTarget(true)
					.set('prompt2', get.prompt2('ybsl_yedun'))
					.set('filterTarget', function (event, player, target) {
						return !player.storage.ybsl_yedun.includes(target) && player != target;
					})
					.forResult();
			}
		},
		async content(event, trigger, player) {
			let target = event.targets[0];
			if (!player.storage.ybsl_yedun) {
				player.storage.ybsl_yedun = [];
			}
			await player.storage.ybsl_yedun.push(target);
			let list = ['令你摸三张牌,然后你本回合不能成为黑色牌目标', '令你失去1点体力,然后你本局游戏获得〖失路〗'];
			event.result2 = await target
				.chooseControl()
				.set('choiceList', list)
				.set('ai', function () {
					let att = get.attitude(_status.event.player, player);
					if (att > 0 && player.hp < 3) {
						return 0;
					}
					return 1;
				})
				.forResult();
			if (event.result2.index) {
				if (event.result2.index == 0) {
					await player.draw(3);
					await player.addTempSkill('ybsl_yedun_weimu');
				} else {
					await player.loseHp();
					await player.addSkill('olshilu');
				}
			}
		},
		subSkill: {
			weimu: {
				trigger: { global: 'useCard1' },
				audio: 'ybsl_yedun',
				forced: true,
				firstDo: true,
				filter(event, player) {
					if (event.player == player) {
						return false;
					}
					if (get.color(event.card) != 'black') {
						return false;
					}
					const info = lib.card[event.card.name];
					return info && info.selectTarget && info.selectTarget == -1 && !info.toself;
				},
				async content() { },
				mod: {
					targetEnabled(card) {
						if (get.color(card) == 'black') {
							return false;
						}
					},
				},
				mark: true,
				marktext: '遁',
				intro: {
					content: '本回合不能成为黑色牌目标',
				},
			},
		},
	},
	ybsl_yedunx: {
		audio: 'ybsl_yedun',
		derivation: ['olshilu'],

		init(player) {
			if (!player.storage.ybsl_yedunx) {
				player.storage.ybsl_yedunx = [];
			}
		},
		trigger: { player: 'damageEnd' },
		filter(event, player) {
			return player.getHistory('damage').indexOf(event) == 0;
		},
		async cost(event, trigger, player) {
			if (!player.storage.ybsl_yedunx) {
				player.storage.ybsl_yedunx = [];
			}
			if (game.countPlayer((c) => !player.storage.ybsl_yedunx.includes(c) && player != c) > 0) {
				event.result = await player
					.chooseTarget(true)
					.set('prompt2', get.prompt2('ybsl_yedunx'))
					.set('filterTarget', function (event, player, target) {
						return !player.storage.ybsl_yedunx.includes(target) && player != target;
					})
					.forResult();
			}
		},
		async content(event, trigger, player) {
			let target = event.targets[0];
			if (!player.storage.ybsl_yedunx) {
				player.storage.ybsl_yedunx = [];
			}
			await player.storage.ybsl_yedunx.push(target);
			let list = ['令你摸三张牌,然后你本回合不能成为黑色牌目标', '令你失去1点体力,然后你本局游戏获得〖失路〗(可以获得多个)'];
			event.result2 = await target
				.chooseControl()
				.set('choiceList', list)
				.set('ai', function () {
					let att = get.attitude(_status.event.player, player);
					if (att > 0 && player.hp < 3) {
						return 0;
					}
					return 1;
				})
				.forResult();
			if (event.result2.index) {
				if (event.result2.index == 0) {
					await player.draw(3);
					await player.addTempSkill('ybsl_yedunx_weimu');
				} else {
					await player.loseHp();

					lib.skill['ybsl_shilu_' + target.playerid] = lib.skill.olshilu;
					lib.translate['ybsl_shilu_' + target.playerid] = lib.translate.olshilu;
					lib.translate['ybsl_shilu_' + target.playerid + '_info'] = lib.translate.olshilu_info;
					await player.addSkill('ybsl_shilu_' + target.playerid);
				}
			}
		},
		subSkill: {
			weimu: {
				trigger: { global: 'useCard1' },
				audio: 'ybsl_yedun',
				forced: true,
				firstDo: true,
				filter(event, player) {
					if (event.player == player) {
						return false;
					}
					if (get.color(event.card) != 'black') {
						return false;
					}
					const info = lib.card[event.card.name];
					return info && info.selectTarget && info.selectTarget == -1 && !info.toself;
				},
				async content() { },
				mod: {
					targetEnabled(card) {
						if (get.color(card) == 'black') {
							return false;
						}
					},
				},
				mark: true,
				marktext: '遁',
				intro: {
					content: '本回合不能成为黑色牌目标',
				},
			},
		},
	},
	ybsl_shilu: {
		audio: 'ext:夜白神略/audio/character:2',
		subSkill: {},
	},

	ybsl_fengci: {
		audio: 'ext:夜白神略/audio/character:2',
		marktext: '祭',
		intro: {
			name: '贡品',
			content: 'expansion',
		},
		subSkill: {
			draw: {
				audio: 'ybsl_fengci',
				trigger: {
					player: 'phaseDrawBegin',
				},
				async cost(event, trigger, player) {
					event.result = { bool: false };
					let cards = player.getExpansions('ybsl_fengci');
					if (cards && cards.length) {
						event.result = await player
							.chooseCardButton(cards, [1, cards.length])
							.set('filterButton', function (button) {
								const cardsy = ui.selected.buttons;
								const cardst = [];
								if (cardsy) {
									for (const i of cardsy) {
										cardst.push(i.link);
									}
								}
								if (cardst) {
									return !get.YB_suit(cardst, 'suit').includes(button.link.suit);
								}
								return true;
							})
							.forResult();
					}
					event.result.cards = event.result.links;
				},
				content() {
					player.discard(event.cards);
					trigger.num += event.cards.length;
				},
			},
		},
	},
	ybsl_fengcix: {
		audio: 'ybsl_fengci',
		forced: true,
		trigger: {
			global: 'loseAfter',
		},
		filter(event, player) {
			if (event.type != 'discard' || event.getlx === false) {
				return false;
			}
			let cards = event.cards.slice(0);
			let evt = event.getl(player);
			if (evt && evt.cards) {
				cards.removeArray(evt.cards);
			}
			for (let i = 0; i < cards.length; i++) {
				if (get.position(cards[i], true) == 'd') {
					return event.player == _status.currentPhase;
				}
			}
			return false;
		},
		async content(event, trigger, player) {
			let cards = [],
				cards2 = trigger.cards.slice(0),
				evt = trigger.getl(player);
			if (evt && evt.cards) {
				cards2.removeArray(evt.cards);
			}
			for (let i = 0; i < cards2.length; i++) {
				if (get.position(cards2[i], true) == 'd') {
					cards.push(cards2[i]);
				}
			}
			let result = { bool: false };
			if (cards.length) {
				result = await trigger.player
					.chooseBool('是:将本次弃置的牌置于' + get.translation(player) + '武将牌上称为<祭><br>否:令你本回合下次摸的牌明置且视为【毒】')
					.set('ai', function () {
						return true;
					})
					.forResult();
			}
			if (result.bool == true || result == true) {
				player.addToExpansion(cards, player, 'gain').gaintag.add('ybsl_fengci');
			} else {
				trigger.player.addTempSkill('ybsl_fengcix_du');
			}
		},
		group: 'ybsl_fengci_draw',
		subSkill: {
			du: {
				forced: true,
				audio: 'ybsl_fengcix',
				trigger: {
					player: 'drawBegin',
				},
				filter(event, player) {
					return event.num > 0;
				},
				firstDo: true,
				content() {
					'step 0';
					player.addTempSkill('ybsl_fengcix_dux');

					trigger.visible = true;
					trigger.gaintag.add('ybsl_fengcix');
					player.when('drawEnd').then(function () {
						if (trigger.gaintag && trigger.gaintag.includes('ybsl_fengcix')) {
							let cards = trigger.result;
							for (const i of cards) {
								i.YB_cardname('du', 'ybsl_fengcix');
							}
						}
					});
					('step 1');
					player.removeSkill('ybsl_fengcix_du');
				},
			},
			dux: {
				forced: true,

				onremove(player) {
					player.removeGaintag('ybsl_fengcix');
				},
			},
		},
	},
	ybsl_youxiang: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	ybsl_youxiangx: {
		audio: 'ybsl_youxiang',
		forced: true,
		global: 'ybsl_youxiangx_bann',
		getLastUsed(player, event) {
			const history = player.getAllHistory('useCard');
			let index;
			if (event) {
				index = history.indexOf(event) - 1;
			} else {
				index = history.length - 1;
			}
			if (index >= 0) {
				return history[index];
			}
			return false;
		},
		subSkill: {
			bann: {
				audio: 'ybsl_youxiang',
				charlotte: true,
				mod: {
					cardEnabled(card, player) {
						let evt = lib.skill.ybsl_youxiangx.getLastUsed(player);
						if (evt && evt.card && get.type2(evt.card) && get.type2(evt.card) == get.type2(card)) {
							if (!player.hasSkill('ybsl_youxiangx')) {
								return false;
							}
						}
					},
				},
			},
		},
		trigger: {
			player: 'useCard',
		},
		filter(event, player) {
			let evt = lib.skill.ybsl_youxiangx.getLastUsed(player, event);
			if (!evt || !evt.card) {
				return false;
			}
			return get.type2(evt.card) && get.type2(evt.card) != get.type2(event.card);
		},
		content() {
			player.draw();
		},
	},
	/**
	 * 索靖
	 */
	ybsl_feimo: {
		trigger: { player: 'useCard' },
		forced: true,
		filter(event) {
			return event.card && event.card.suit == 'club' && event.card.isCard;
		},
		content() {
			player.draw();
		},
		ai: {
			threaten: 1.4,
		},
	},
	ybsl_benzhan: {
		zhuanhuanji: true,
		mark: true,
		marktext: '☯',
		init(player, skill) {
			player.storage[skill] = true;
		},
		intro: {
			markcount(storage, player) {
				let num = player.storage.ybsl_benzhan_used || 0;
				const numb = player.getDamagedHp();
				if (num >= numb) {
					return "<span class='firetext'>" + num + '/' + numb + '</span>';
				}
				return num + '/' + numb;
			},
			content(storage, player, skill) {
				if (player.storage.ybsl_benzhan == true) {
					return '转换技,<span class="bluetext">阳:你可以将一张【杀】当伤害锦囊牌使用,或将一张伤害锦囊牌当【杀】使用;</span>阴:你可以将一张【闪】当非伤害锦囊牌使用,或将一张非伤害锦囊牌当【闪】使用.每回合限X次,当你使用此技能时,此技能不转换,X为你已损体力值';
				}
				return '转换技,阳:你可以将一张【杀】当伤害锦囊牌使用,或将一张伤害锦囊牌当【杀】使用;<span class="bluetext">阴:你可以将一张【闪】当非伤害锦囊牌使用,或将一张非伤害锦囊牌当【闪】使用.</span>每回合限X次,当你使用此技能时,此技能不转换,X为你已损体力值';
			},
		},
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		hiddenCard(player, name) {
			let type = get.type2(name);
			if (player.storage.ybsl_benzhan) {
				return (type == 'trick' && get.tag(name, 'damage') > 0.5) || name == 'sha';
			}
			return (type == 'trick' && (!get.tag({ name }, 'damage') || get.tag({ name }, 'damage') < 0.5)) || name == 'shan';
		},
		filter(event, player) {
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			for (let name of lib.inpile) {
				if (player.storage.ybsl_benzhan) {
					if (((get.type2(name) == 'trick' && get.tag({ name }, 'damage') > 0.5) || name == 'sha') && evt({ name }, player, event)) {
						return true;
					}
				} else if (((get.type2(name) == 'trick' && (!get.tag({ name }, 'damage') || get.tag({ name }, 'damage') < 0.5)) || name == 'shan') && evt({ name }, player, event)) {
					return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];
				for (let name of lib.inpile) {
					if (player.storage.ybsl_benzhan) {
						if ((get.type2(name) == 'trick' && get.tag({ name }, 'damage') > 0.5) || name == 'sha') {
							list.push([get.type(name), '', name]);
						}
					} else if ((get.type2(name) == 'trick' && (!get.tag({ name }, 'damage') || get.tag({ name }, 'damage') < 0.5)) || name == 'shan') {
						list.push([get.type(name), '', name]);
					}
				}
				return ui.create.dialog('奔战', [list, 'vcard']);
			},
			check(button) {
				return 1;
			},
			filter(button, player) {
				return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
			},
			backup(links, player) {
				return {
					audio: 'ybsl_benzhan',
					filterCard(card, player) {
						if (player.storage.ybsl_benzhan) {
							if (links[0][2] == 'sha') {
								return get.type2(card) == 'trick' && get.tag(card, 'damage');
							}
							return card.name == 'sha';
						} else {
							if (links[0][2] == 'shan') {
								return get.type2(card) == 'trick' && !get.tag(card, 'damage');
							}
							return card.name == 'shan';
						}
					},
					selectCard: 1,
					viewAs: { name: links[0][2] },
					position: 'hes',
					precontent() {
						player.addTempSkill('ybsl_benzhan_used', 'phaseAfter');
						if (!player.storage.ybsl_benzhan_used) {
							player.storage.ybsl_benzhan_used = 0;
						}
						if (player.storage.ybsl_benzhan_used < player.getDamagedHp()) {
							player.storage.ybsl_benzhan_used++;
						} else {
							player.changeZhuanhuanji('ybsl_benzhan');
						}
					},
					prompt: '选择一张牌当【' + get.translation(links[0][2]) + '】使用',
				};
			},
		},

		ai: {
			respondSha: true,
			respondShan: true,
			skillTagFilter(player, tag, arg) {
				if (arg == 'respond') {
					return false;
				}
			},
			order: 1,
			result: {
				player: 1,
			},
		},
		subSkill: {
			used: {
				init(player) {
					player.storage.ybsl_benzhan_num = 0;
				},
				charlotte: true,
			},
		},
	},
	/**
	 * 王裒
	 */
	ybsl_zhelei: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: ['phaseJudgeBefore', 'damageBefore'],
		},
		filter(event, player) {
			if (player.isLinked() || event.player.isLinked()) {
				return false;
			}
			return true;
		},
		async content(event, trigger, player) {
			await player.link(true);
			if (player != trigger.player) {
				await trigger.player.link(true);
			}
			trigger.cancel();
		},
		check(event, player, name) {
			let att = get.attitude(player, event.player);
			if (att > 5) {
				if (name == 'phaseJudgeBefore') {
					return event.player.countCards('j') > 0;
				}
				return true;
			}
			return false;
		},
	},
	ybsl_xunxiao: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			global: 'damageBegin1',
		},
		filter(event, player) {
			return player.isLinked() && event.source?.isIn();
		},
		async content(event, trigger, player) {
			trigger.nature = 'fire';
		},
	},
	ybsl_wanbie: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		selectCard() {
			const player = _status.event.player;
			if (player.isLinked()) {
				return [0, 1];
			} else {
				return 1;
			}
		},
		filterCard: true,
		position: 'he',
		selectTarget: 1,
		filterTarget(card, player, target) {
			return player != target && (target.isLinked() || target.countDiscardableCards(target, 'he'));
		},
		async content(event, trigger, player) {
			const target = event.target;
			if (event.cards.length <= 0) {
				player.link(false);
			}
			let bool = target.isLinked() ? false : true;
			let str = '请弃置一张牌' + (target.isLinked() ? ',或点取消解除横置' : '') + ',然后' + get.translation(player) + '与你各摸一张牌';
			let result = await target.chooseToDiscard('he', 1, bool, str).forResult();
			if (!result.bool) {
				await target.link(false);
			}
			await game.asyncDraw([player, target].sortBySeat(player));
		},
		ai: {
			result: {
				player: 2,
				target: 1,
			},
		},
	},
	ybsl_oldwanbie: {
		audio: 'ybsl_wanbie',
		trigger: {
			player: 'phaseDrawBegin2',
		},
		filter(event, player) {
			return game.countPlayer((c) => c.isLinked()) > 0;
		},
		async content(event, trigger, player) {
			let num = game.countPlayer((c) => c.isLinked());
			trigger.num += num;
			player.addSkill('ybsl_oldwanbie_2');
		},
		subSkill: {
			2: {
				forced: true,
				popup: false,
				sourceSkill: 'ybsl_oldwanbie',
				trigger: { player: 'phaseDrawEnd' },
				async content(event, trigger, player) {
					player.removeSkill('ybsl_oldwanbie_2');
					if (player.countCards('he') <= 0) {
						return;
					}

					await player.YB_liangying(
						true,
						player.getCards('he'),
						game.countPlayer((c) => c.isLinked()),
					);
				},
			},
		},
	},
	/**
	 * 羊续
	 */
	ybsl_kanxiao: {
		audio: 'ext:夜白神略/audio/character:2',
		chargeSkill: 3,
		trigger: {
			player: ['damageAfter', 'loseHpAfter', 'loseEnd'],
		},
		filter(event, player, name) {
			if (name == 'loseEnd') {
				return player.countCharge() > 0 && player.isDamaged();
			} else {
				return player.countCharge() > 0;
			}
		},
		init(player) {
			if (!player.storage.ybsl_kanxiao) {
				player.storage.ybsl_kanxiao = 0;
			}
		},
		usable(skill, player) {
			let num = player.getStorage('ybsl_kanxiao');
			return player.storage.ybsl_kanxiao + 1;
		},
		content() {
			'step 0';
			player.removeCharge();
			if (event.triggername == 'loseEnd') {
				player.recover();
			} else {
				player.draw(2);
			}
		},
		group: [/*"ybsl_kanxiao_damage",*/ 'ybsl_kanxiao_init'],
		subSkill: {
			init: {
				audio: 'ybsl_kanxiao',
				trigger: {
					global: 'phaseBefore',
					player: 'enterGame',
				},
				forced: true,
				filter(event, player) {
					return (event.name != 'phase' || game.phaseNumber == 0) && player.countCharge(true);
				},
				content() {
					player.addCharge(1);
				},
			},
		},
	},
	ybsl_shipin: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			target: 'useCardToTargeted',
			player: 'useCard',
		},
		usable(skill, player) {
			let num = player.getStorage('ybsl_shipin');
			return player.storage.ybsl_shipin + 1;
		},
		init(player) {
			if (!player.storage.ybsl_shipin) {
				player.storage.ybsl_shipin = 0;
			}
		},
		filter(event, player, name) {
			if (name == 'useCard') {
				return (!event.targets.length || !event.targets.includes(player)) && player.countCards('h') <= 1;
			}
			return player.countCards('h') <= 1;
		},
		async content(event, trigger, player) {
			const hs = player.getCards('h');
			if (hs.length) {
				await player.showCards(hs);
			}
			await player.addCharge();
			if (hs.length == 1 && get.type2(hs[0]) != 'trick') {
				await player.discard(hs);
				let list = [];
				if (player.getStorage('ybsl_kanxiao') == 0) {
					list.push('ybsl_kanxiao');
				}
				if (player.getStorage('ybsl_shipin') == 0) {
					list.push('ybsl_shipin');
				}
				if (!list.length) {
					return;
				}
				const { result } = await player.chooseControl(list);
				if (result.control) {
					player.storage[result.control]++;
					game.log(player, '修改了' + result.control + '的技能效果');
				}
			}
		},
	},

	ybsl_shehao: {
		audio: 'ext:夜白神略/audio/character:2',
		zhuanhuanji: true,
		mark: true,
		marktext: '☯',
		intro: {
			content(storage, player) {
				if (player.storage.ybsl_shehao == true) {
					return '转换技,当你使用非虚拟或转化的非装备牌后,你需选择是否:阳:将此牌置入装备区一个空栏;<span class="bluetext">阴:选择装备区一张同类型的牌,然后弃置之并摸X张牌或将之当作触发此技能的牌使用(X为弃置的牌与触发技能使用的牌[花色,点数,牌名字数]相同的项数),以此法使用的牌不计入次数且无次数限制.</span><br>此技能选是不转,选否才转';
				} else {
					return '转换技,当你使用非虚拟或转化的非装备牌后,你需选择是否:<span class="bluetext">阳:将此牌置入装备区一个空栏;</span>阴:选择装备区一张同类型的牌,然后弃置之并摸X张牌或将之当作触发此技能的牌使用(X为弃置的牌与触发技能使用的牌[花色,点数,牌名字数]相同的项数),以此法使用的牌不计入次数且无次数限制.<br>此技能选是不转,选否才转';
				}
			},
		},
		forced: true,
		trigger: {
			player: 'useCardAfter',
		},
		filter(event, player) {
			if (event.card && event.card.isCard && event.cards && event.cards[0] && get.type2(event.card) != 'equip') {
				return true;
			}
			return false;
		},
		async content(event, trigger, player) {
			if (!player.storage.ybsl_shehao) {
				let list = [];
				const sub = ['武器', '防具', '防马', '攻马', '宝物'];
				for (let i = 1; i < 6; i++) {
					if (player.hasEmptySlot(i)) {
						list.push(sub[i - 1]);
					}
				}
				const dialog = ui.create.dialog('奢豪');
				dialog.addText('请选择置入一个装备栏');
				dialog.add([sub, 'tdnodes']);
				let result = await player
					.chooseButton(dialog, 1)
					.set('filterButton', function (button) {
						return list.includes(button.link);
					})
					.set('filterOk', function (buttons) {
						const player = _status.event.player;
						const trigger = _status.event.getTrigger();
						return ui.selected.buttons[0] && trigger.cards && get.position(trigger.cards[0], true) == 'o';
					})
					.forResult();
				if (result.bool) {
					let type = null;
					let links = result.links;
					type = sub.includes(links[0]) ? 'equip'.concat(sub.indexOf(links[0]) + 1) : null;
					if (type != null) {
						const card = trigger.cards[0];
						card.subtypes = [type];
						await player.equip(card);
					}
					event.finish();
				} else {
					await player.changeZhuanhuanji('ybsl_shehao');
					event.finish();
				}
			} else {
				let cards = player.getCards('e');
				const listx = ['摸牌', '转化'];
				const dialog = ui.create.dialog('奢豪');
				dialog.addText('请选择一个卡牌和效果');
				if (cards.length) {
					dialog.add(cards);
					dialog.add([listx, 'tdnodes']);
				}
				let result = await player
					.chooseButtonTarget({
						createDialog: dialog,
						filterButton(button) {
							let type = typeof button.link;
							if (ui.selected.buttons.length && type == typeof ui.selected.buttons[0].link) {
								return false;
							}
							const trigger = _status.event.parent.getTrigger();
							if (type != 'string') {
								if (ui.selected.buttons[0]?.link == '转化' && !lib.filter.filterCard(get.autoViewAs(trigger.card, button.link), player, get.event())) {
									return false;
								}
								return get.type2(trigger.card) == get.type2(button.link);
							}
							if (ui.selected.buttons.length && button.link == '转化') {
								return lib.filter.filterCard(get.autoViewAs(trigger.card, ui.selected.buttons[0].link), player, get.event());
							}
							return true;
						},
						selectButton: 2,
						selectTarget() {
							const buttons = ui.selected.buttons;
							const aaa = [];
							buttons.forEach((button) => {
								if (typeof button === 'object') {
									aaa.unshift(button);
								} else if (typeof button === 'string') {
									aaa.push(button);
								}
							});
							const trigger = _status.event.parent.getTrigger();
							if (aaa[0] == '摸牌') {
								return 0;
							}
							return lib.filter.selectTarget(get.autoViewAs(trigger.card, aaa[0]), get.player());
						},
						filterTarget(card, player, target) {
							const buttons = ui.selected.buttons;
							const aaa = [];
							buttons.forEach((button) => {
								if (typeof button === 'object') {
									aaa.unshift(button);
								} else if (typeof button === 'string') {
									aaa.push(button);
								}
							});
							if (aaa[1] == '摸牌') {
								return false;
							} else {
								const trigger = _status.event.parent.getTrigger();
								let card = get.autoViewAs(trigger.card, aaa[0]);
								return lib.filter.filterTarget(card, player, target);
							}
						},
					})
					.forResult();
				if (result.bool && result.links?.length) {
					const aaa = [];
					result.links.forEach((button) => {
						if (typeof button === 'object') {
							aaa.unshift(button);
						} else if (typeof button === 'string') {
							aaa.push(button);
						}
					});
					if (aaa[1] == '摸牌') {
						let num = 0;
						if (aaa[0].suit == trigger.card.suit) {
							num++;
						}
						if (aaa[0].number == trigger.card.number) {
							num++;
						}
						if (get.cardNameLength(aaa[0]) == get.cardNameLength(trigger.card)) {
							num++;
						}
						await player.discard(aaa[0]);
						await player.draw(num);
					} else {
						let card = trigger.card;
						if (!card) {
							return;
						}
						card.isCard = false;
						const targets = result.targets;
						await player.useCard(card, targets, [aaa[0]], false);
					}
					event.finish();
				} else {
					await player.changeZhuanhuanji('ybsl_shehao');
					event.finish();
				}
			}
		},
	},
	ybsl_jugu: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	ybsl_jiegu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'gameDrawBegin',
		},
		forced: true,
		filter(event, player) {
			return true;
		},
		async content(event, trigger, player) {
			const me = player;
			const numx = trigger.num;
			trigger.num = function (player) {
				return player == me
					? (typeof numx == 'function' ? numx(player) : numx) +
					game.countPlayer(function (current) {
						return current != me;
					})
					: (typeof numx == 'function' ? numx(player) : numx) - 1;
			};
		},
	},
	ybsl_daixin: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCard',
		},
		filter(event, player) {
			if (event.card && event.card.isCard && event.cards && event.cards[0] && get.type2(event.card) != 'equip') {
				return true;
			}
			return false;
		},
		getIndex(event, player) {
			if (!player.storage.ybsl_daixin_used || (player.storage.ybsl_daixin_used && !player.storage.ybsl_daixin_used.includes(event.card.name))) {
				return 1;
			}
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCard('是否发动代薪？', 'he')
				.set('filterCard', function (card) {
					return get.type2(card) == 'equip';
				})
				.forResult();
		},
		async content(event, trigger, player) {
			(player.addTempSkill('ybsl_daixin_used'), (player.storage.ybsl_daixin_used = player.storage.ybsl_daixin_used || []));
			player.storage.ybsl_daixin_used.push(trigger.card.name);
			let card = [];
			let subtype = null;
			card.push(event.cards[0]);
			if (player.getCards('e') && player.getCards('e').includes(event.cards[0])) {
				subtype = get.subtype(event.cards[0]);
			}
			const cardx = [];
			cardx.push(trigger.cards[0]);
			await player.lose(card, 'visible', ui.ordering);
			trigger.cards = card;
			trigger.card.isCard = false;
			if (subtype != null) {
				const cardz = cardx[0];
				cardz.subtypes = [subtype];
				await player.equip(cardz);
			} else {
				await player.gain(cardx, 'gain2');
			}
		},
		subSkill: {
			used: {
				mark: true,
				marktext: '薪',
				intro: {
					content(storage, player) {
						let list = player.storage.ybsl_daixin_used || [];
						list = get.YB_suit(list, 'translation');
						return '本回合已回收卡牌:' + list;
					},
				},
			},
		},
	},

	ybsl_youyou: {
		audio: 'ext:夜白神略/audio/character:2',
		zhuanhuanji: true,
		mark: true,
		intro: {
			content(storage, player) {
				if (player.storage.ybsl_youyou == true) {
					return '转换技,每名角色出牌阶段限一次,其可以:①弃置两张手牌(不足不能用),然后令你回复一点体力上限;<span class="bluetext">②回复一点体力,然后令你弃置两张手牌(不足全弃)</span>.若不为该角色首次对你发动,则回复改为失去';
				} else {
					return '转换技,每名角色出牌阶段限一次,其可以:<span class="bluetext">①弃置两张手牌(不足不能用),然后令你回复一点体力上限</span>;②回复一点体力,然后令你弃置两张手牌(不足全弃).若不为该角色首次对你发动,则回复改为失去';
				}
			},
		},
		global: 'ybsl_youyou_global',

		subSkill: {
			global: {
				audio: 'ybsl_youyou',
				enable: 'phaseUse',
				filter(event, player) {
					return (
						!player.storage.ybsl_youyou_used ||
						game.filterPlayer((current) => {
							return current.hasSkill('ybsl_youyou') && !player.storage.ybsl_youyou_used.includes(current);
						})
					);
				},
				selectTarget: 1,
				filterTarget(card, player, target) {
					if (target.hasSkill('ybsl_youyou') || player.storage.ybsl_youyou_used.includes(target)) {
						return false;
					} else {
						if (target.storage.ybsl_youyou == true) {
							return true;
						} else {
							return player.countDiscardableCards(player, 'h') >= 2;
						}
					}
				},
				selectCard() {
					if (!ui.selected.targets.length) {
						return false;
					}
					let target = ui.selected.targets[0];
					if (target.storage.ybsl_youyou == true) {
						return 0;
					} else {
						return 2;
					}
				},
				position: 'h',
				async content(event, trigger, player) {
					let target = event.targets[0];
					if (!target.storage.ybsl_youyou_vv) {
						target.storage.ybsl_youyou_vv = [];
					}
					let cards = event.cards;
					const func = target.storage.ybsl_youyou_vv.includes(player) ? 'lose' : 'recover';
					const func2 = target.storage.ybsl_youyou_vv.includes(player) ? 'lose' : 'gain';
					target.storage.ybsl_youyou_vv.push(player);
					await target.changeZhuanhuanji('ybsl_youyou');
					if (!cards) {
						await player[func]();
						await target.chooseToDiscard(2, 'h', true);
					} else {
						await target[func + 'MaxHp']();
					}
				},
			},
		},
	},
	ybsl_shangli: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	ybsl_clanqianlei: {
		clanSkill: true,
		trigger: {
			player: ['YB_anySkipped', 'YB_anyCancelled'],
		},
		forced: true,
		content() {
			'step 0';
			player.loseHp();
			('step 1');
			let list = get.YB_clan(player, true);
			if (list.length) {
				player
					.chooseTarget(1, true, function (card, player, target) {
						return list.includes(target);
					})
					.set('prompt', '请选择一名同族角色,令其执行一个额外回合')
					.set('ai', function (target) {
						if (list.includes(player)) {
							return target == player;
						} else {
							return get.attitude(player, target);
						}
					});
			}
			('step 2');
			if (result.targets) {
				result.targets[0].phase('nodelay');
			}
			let evt = _status.event.getParent('phase');
			if (evt) {
				game.resetSkills();
				_status.event = evt;
				_status.event.finish();
				_status.event.untrigger(true);
			}
		},
	},

	ybsl_clanxingzu: {
		clanSkill: true,
		trigger: {
			player: 'useCardAfter',
		},
		filter(event, player) {
			if (player.getStat('damage')) {
				return false;
			}
			let list = [];
			player.getHistory('useCard', function (evt) {
				if (evt != event) {
					list.push(evt.card);
				}
			});
			for (const i of list) {
				if (get.type2(i) == get.type2(event.card)) {
					return false;
				}
			}
			let list = get.YB_clan(player, true);
			const list2 = {};
			for (const k of list) {
				let skills = get.YB_pu1(k);

				if (!skills.length) {
					list.remove(k);
				}
			}
			return list.length;
		},

		async cost(event, trigger, player) {
			let list = get.YB_clan(player, true);
			const list2 = {};
			for (const k of list) {
				let skills = get.YB_pu1(k);

				if (!skills.length) {
					list.remove(k);
				}
			}
			event.result = await player
				.chooseTarget(1, function (card, player, target) {
					return list.includes(target);
				})
				.set('prompt', '请选择一名同族角色,令其发动一个<出牌阶段限一次>的技能')
				.set('ai', function (target) {
					if (list.includes(player)) {
						return target == player;
					} else {
						return get.attitude(player, target);
					}
				})
				.forResult();
		},

		content: async function (event, trigger, player) {
			const targets = event.targets;
			const skillList = [];

			const list66 = get.YB_pu1(targets[0]);

			const skill = await targets[0].YB_control(list66, 8, '请选择一个出限一技能发动').forResult();
			if (skill.control && skill.control != 'cancel2') {
				if (!targets[0].getStat('skill')[skill.control]) {
					targets[0].getStat('skill')[skill.control] = 0;
				}
				targets[0].getStat('skill')[skill.control]--;

				const skillName = skill.control;

				const ybnext = game.createEvent('YB_xingzu');
				ybnext.tar = targets[0];
				ybnext.skillname = skillName;
				ybnext.setContent(async function (event, trigger, player) {
					let next = event.tar.chooseToUse();
					next.set('openskilldialog', get.prompt(event.skillname));
					next.set('norestore', true);
					next.set('_backupevent', event.skillname);
					next.set('custom', {
						add: {},
						replace: {
							window() { },
						},
					});

					next._triggered = null;
					next.backup(event.skillname);

					const result = await next.forResult();

					if (!result.bool) {
						event.tar.getStat('skill')[event.skillname]++;
					}
				});
				await ybnext;
			}
		},
	},

	ybsl_lxtujing: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterTarget(card, player, target) {
			return player != target && !target.isMinHandcard();
		},
		selectTarget: [0, 1],
		filterOk() {
			game.filterPlayer((current) => current.unprompt());
			const target = ui.selected.targets[0];
			if (!target) {
				return false;
			}
			game.filterPlayer((current) => {
				if (current.countCards() < target.countCards()) {
					current.prompt('使用杀');
				}
			});
			return true;
		},
		content: async function (event, trigger, player) {
			let target = event.target;
			let list = [];
			game.countPlayer(function (con) {
				if (con.countCards('h') < target.countCards('h')) {
					list.push(con);
				}
			});
			list.sortBySeat(player);
			for (const i of list) {
				if (i.isIn()) {
					let result = await i
						.chooseCard(
							'h',
							function (card, i) {
								if (!game.checkMod(card, i, 'unchanged', 'cardEnabled2', i)) {
									return false;
								}
								return i.canUse(
									get.autoViewAs(
										{
											name: 'sha',
										},
										[card],
									),
									target,
									false,
								);
							},
							'选择一张手牌当做【杀】对' + get.translation(target) + '使用',
						)
						.set('ai', function (card) {
							const player = _status.event.player;
							return (
								get.effect(
									target,
									get.autoViewAs(
										{
											name: 'sha',
										},
										[card],
									),
									player,
									player,
								) / Math.max(1, get.value(card))
							);
						})
						.forResult();
					if (result.bool) {
						i.useCard(
							{
								name: 'sha',
							},
							result.cards,
							target,
							false,
						);
					}
				}
			}
		},
		ai: {
			order: 9,
			result: {
				target(player, target) {
					let num = 0;
					let list = [];
					game.countPlayer(function (con) {
						if (con.countCards('h') < target.countCards('h')) {
							list.push(con);
						}
					});
					list.sortBySeat(player);
					for (const i of list) {
						if (
							get.effect(
								target,
								{
									name: 'sha',
								},
								player,
								player,
							)
						) {
							num += 2;
						}
					}
					return -num;
				},
			},
			threaten: 3,
		},
	},
	ybsl_lxweiyu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterTarget(card, player, target) {
			return true;
		},
		content: async function (event, trigger, player) {
			let target = event.target;
			await target.draw(2, 'visible').set('gaintag', ['ybsl_lxweiyu_buff']);
			await target.addTempSkill('ybsl_lxweiyu_buff');
		},
		subSkill: {
			buff: {
				mod: {
					cardEnabled(card) {
						for (const cardx of card.cards) {
							if (!cardx.hasGaintag('ybsl_lxweiyu_buff')) {
								return false;
							}
						}
					},
					cardUsable(card) {
						for (const cardx of card.cards) {
							if (!cardx.hasGaintag('ybsl_lxweiyu_buff')) {
								return false;
							}
						}
					},
					cardSavable(card) {
						for (const cardx of card.cards) {
							if (!cardx.hasGaintag('ybsl_lxweiyu_buff')) {
								return false;
							}
						}
					},
				},
				mark: true,
				marktext: '傲',
				intro: {
					name: '傲慢',
					markcount(storage, player) {
						return player.countCards('h', (card) => card.hasGaintag('ybsl_lxweiyu_buff'));
					},
					mark(dialog, content, player) {
						let cards = player.getCards('h', (card) => card.hasGaintag('ybsl_lxweiyu_buff'));
						if (cards.length) {
							dialog.addAuto(cards);
						} else {
							return '无可使用牌';
						}
					},
				},
			},
		},
		ai: {
			order: 9,
			result: {
				target(player, target) {
					if (target.countCards('h') < 3) {
						return 2;
					} else {
						return -1;
					}
				},
			},
			threaten: 3,
		},
	},

	ybsl_lyyaoe: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,

		trigger: {
			player: 'useCard',
		},
		filter(event, player) {
			if (player.hasSkill('ybsl_lyyaoe_suit')) {
				return false;
			} else if (!player.isPhaseUsing() || !event.targets.length) {
				return false;
			}
			const tars = event.targets.filter((current) => current != player);
			return tars.length;
		},

		content() {
			'step 0';
			player.damage(player);
			('step 1');
			for (const i of trigger.targets.filter((su) => su != player).sortBySeat(player)) {
				i.damage(player);
			}
		},
		ai: {
			result: {
				player(player, target) {
					if (!player.hasSkill('ybsl_lyyaoe_suit') && player.isPhaseUsing()) {
						if (event.targets.length && event.targets.filter((current) => current != player).length) {
							return -2;
						}
					}
					return 1;
				},
			},
		},

		subSkill: {
			suit: {
				forced: true,
				audio: 'ybsl_lyyaoe',
				mark: true,
				marktext: '<span style="text-decoration: line-through;">伤</span>',
				intro: {
					content(storage, player) {
						return '已封印夭厄';
					},
				},
			},
			number: {
				forced: true,
				audio: 'ybsl_lyyaoe',
				mark: true,
				marktext: '<span style="text-decoration: line-through;">限</span>',
				intro: {
					content(storage, player) {
						return '已封印二效果';
					},
				},
			},
		},
	},
	ybsl_lytiandu: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	ybsl_lykangming: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		content: async function (event, trigger, player) {
			const jud = await player.judge().forResult();
			let card = jud.card;
			const cho = await player
				.chooseCard('he', function (cardx) {
					if (card.suit != cardx.suit) {
						return false;
					}
					return true;
				})
				.set('ai', function (cardx) {
					if (!player.hasSkill('ybsl_lyyaoe_suit')) {
						return card.suit == cardx.suit && card.number != cardx.number;
					}
					return false;
				})
				.set('prompt', get.prompt('ybsl_lykangming'))
				.forResult();

			if (cho.cards) {
				const cardy = cho.cards[0];
				await player.discard(cardy);
				if (cardy.suit == card.suit && cardy.number == card.number) {
					await player.addTempSkill(['ybsl_lyyaoe_suit', 'ybsl_lyyaoe_number']);
					await player.markSkill(['ybsl_lyyaoe_suit', 'ybsl_lyyaoe_number']);
					await player.loseMaxHp();
				} else if (cardy.suit == card.suit) {
					await player.addTempSkill('ybsl_lyyaoe_suit');
					await player.markSkill('ybsl_lyyaoe_suit');
				}
			}
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
	},

	ybsl_ljfumin: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		filterTarget(card, player, target) {
			return player != target;
		},
		selectCard: 1,
		filterCard: true,
		discard: false,
		lose: false,
		position: 'h',
		check(card) {
			if (card.name == 'du') {
				return 20;
			}
			if (card.name == 'tao') {
				return -1;
			}
			if (card.name == 'ybsl_juhua') {
				return -1;
			}
			return 10 - get.value(card);
		},
		content() {
			'step 0';
			player.give(cards, target);
			('step 1');
			if (player.countCards('h') == target.countCards('h')) {
				player.getStat('skill').ybsl_ljfumin = 0;
			} else if (player.countCards('h') < target.countCards('h')) {
				player.draw(2);
			} else {
				target.draw(2);
			}
		},
		ai: {
			order: 2,
			result: {
				target(player, target) {
					if (player.countCards('h') - target.countCards('h') > 2) {
						return 3;
					} else {
						return 1;
					}
				},
				player(player, target) {
					if (player.countCards('h') - target.countCards('h') < 2) {
						return 2;
					} else {
						return 0;
					}
				},
			},
		},
	},
	ybsl_ljguihang: {
		audio: 'ext:夜白神略/audio/character:2',
		dutySkill: true,
		forced: true,
		group: ['ybsl_ljguihang_1', 'ybsl_ljguihang_2'],
		subSkill: {
			1: {
				forced: true,
				audio: 'ybsl_ljguihang',
				trigger: {
					player: 'loseAfter',
					global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
				},
				filter(event, player) {
					if (player.countCards('h') >= player.maxHp) {
						return false;
					}
					const evt = event.getl(player);
					return evt && evt.player == player && evt.hs && evt.hs.length;
				},
				async content(event, trigger, player) {
					player.gain(lib.card.ying.getYing(player.maxHp - player.countCards('h')), 'gain2');
				},
			},
			2: {
				forced: true,
				audio: 'ybsl_ljguihang',
				trigger: {
					player: 'phaseZhunbeiBegin',
				},
				filter(event, player) {
					let cards = player.getCards('h');
					for (const i of cards) {
						if (i.name != 'ying') {
							return false;
						}
					}
					return true;
				},
				content: async function (event, trigger, player) {
					game.log(player, '成功完成使命');
					await player.awakenSkill('ybsl_ljguihang');
					const num = player.getCards('h').length;
					await player.discard(player.getCards('h'));
					await player.addMark('nzry_huaiju', num);
					await player.addSkill('nzry_huaiju');
					await player.addSkill('nzry_huaiju_ai');
					await player.draw(Math.min(num, 5));
					await player.addMaxHp();
				},
			},
		},
	},

	ybsl_kegu: {
		enable: 'chooseToUse',
		usable: 1,
		audio: 'ext:夜白神略/audio/character:2',
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		filterCard(card, player, event) {
			event = event || _status.event;
			const filter = event._backup.filterCard;
			if (filter({ name: card.name, isCard: false, nature: get.nature(card) }, player, event)) {
				return true;
			}
			return false;
		},
		selectCard: 1,
		viewAs(cards, player) {
			const cardx = cards[0];
			if (!cardx) {
				return false;
			}
			let name = cardx.name;
			const nature = get.nature(cardx);
			const suit = cardx.suit;
			let card = {
				name: name,
				nature: nature,
				suit: suit,
			};
			if (name) {
				return card;
			}
			return null;
		},

		discard: false,
		losecard: false,
		lose: false,
		position: 'h',
		precontent() {
			'step 0';
			player.showCards(event.result.cards);
			('step 1');
			event.result.cards = [];
		},
	},
	/** */

	sgsk_zhizun: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		charlotte: true,
		superCharlotte: true,
		zhizunFilter() {
			if (ui.discardPile.hasChildNodes()) {
				let card = Array.from(ui.discardPile.childNodes)[ui.discardPile.childNodes.length - 1];
				return card.number == 5 || card.number == 9;
			}
			return false;
		},
	},
	sgsk_zhizunx: {
		audio: 'sgsk_zhizun',
		filter(event, player) {
			if (event.name == 'useCard') {
				return (event.card && event.card.number == 5) || event.card.number == 9;
			}
			return lib.skill.sgsk_zhizun.zhizunFilter();
		},
		trigger: {
			player: ['damageBefore', 'damageBegin1', 'damageBegin2', 'damageBegin3', 'damageBegin4', 'useCardAfter'],
		},
		content() {
			if (event.triggername == 'useCardAfter') {
				player.draw();
			} else {
				event.cancel();
			}
		},
		forced: true,
		charlotte: true,
		superCharlotte: true,
		mod: {
			targetEnabled(card) {
				if (lib.skill.sgsk_zhizun.zhizunFilter()) {
					return false;
				}
			},
		},
		group: 'sgsk_zhizunx_log',
		subSkill: {
			log: {
				audio: 'sgsk_zhizun',
				trigger: { global: 'useCard1' },
				forced: true,
				firstDo: true,
				filter(event, player) {
					if (event.player == player) {
						return false;
					}
					if (!lib.skill.sgsk_zhizun.zhizunFilter()) {
						return false;
					}
					const info = lib.card[event.card.name];
					return info && info.selectTarget && info.selectTarget == -1 && !info.toself;
				},
				content() { },
			},
		},
	},

	sgsk_wugu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.getCards('h') && player.getCards('h').length && game.filterPlayer((c) => c != player).length;
		},
		content() {
			'step 0';
			ui.clear();
			let cards;
			if (player.getCards('h') && player.getCards('h').length) {
				cards = player.getCards('h');
				const lose_list = [],
					cards2 = [];
				cards.forEach((card) => {
					const owner = get.owner(card);
					if (owner) {
						const arr = lose_list.find((i) => i[0] == owner);
						if (arr) {
							arr[1].push(card);
						} else {
							lose_list.push([owner, [card]]);
						}
					} else {
						cards2.add(card);
					}
				});

				game.delayex();
				const dialog = ui.create.dialog('神农五谷', cards, true);
				_status.dieClose.push(dialog);
				dialog.videoId = lib.status.videoId++;
				game.addVideo('cardDialog', null, ['神农五谷', get.cardsInfo(cards), dialog.videoId]);
				event.parent.preResult = dialog.videoId;
				game.broadcast(
					function (cards, id) {
						const dialog = ui.create.dialog('神农五谷', cards, true);
						_status.dieClose.push(dialog);
						dialog.videoId = id;
					},
					cards,
					dialog.videoId,
				);
				event.dialog = dialog;
				game.log(player, '五谷展示了', cards);
			} else {
				event.finish();
			}
			('step 1');
			const targets2 = game
				.filterPlayer()
				.sortBySeat(player)
				.filter((c) => c != player);
			for (const k of targets2) {
				let next = game.createEvent('sgsk_wugu', false);
				next.target = k;
				if (event.dialog) {
					next.dialog = event.dialog;
				}

				next.preResult = event.preResult;
				next.setContent(function () {
					let target = event.target;
					('step 0');
					for (let i = 0; i < ui.dialogs.length; i++) {
						if (ui.dialogs[i].videoId == event.preResult) {
							event.dialog = ui.dialogs[i];
							break;
						}
					}
					if (!event.dialog || event.dialog.buttons.length == 0) {
						event.finish();
						return;
					}
					if (event.dialog.buttons.length > 1) {
						let next = target.chooseButton(true);
						next.set('ai', (button) => {
							let player = _status.event.player,
								card = button.link,
								val = get.value(card, player);
							if (get.tag(card, 'recover')) {
								val += game.countPlayer((target) => {
									return target.hp < 2 && get.attitude(player, target) > 0 && lib.filter.cardSavable(card, player, target);
								});
								if (player.hp <= 2 && game.checkMod(card, player, 'unchanged', 'cardEnabled2', player)) {
									val *= 2;
								}
							}
							return val;
						});
						next.set('dialog', event.preResult);
						next.set('closeDialog', false);
						next.set('dialogdisplay', true);
					} else {
						event.directButton = event.dialog.buttons[0];
					}
					('step 1');
					const dialog = event.dialog;
					let card;
					if (event.directButton) {
						card = event.directButton.link;
					} else {
						for (const i of dialog.buttons) {
							if (i.link == result.links[0]) {
								card = i.link;
								break;
							}
						}
						if (!card) {
							card = event.dialog.buttons[0].link;
						}
					}
					let button;
					for (let i = 0; i < dialog.buttons.length; i++) {
						if (dialog.buttons[i].link == card) {
							button = dialog.buttons[i];
							button.querySelector('.info').innerHTML = (function (target) {
								if (target._tempTranslate) {
									return target._tempTranslate;
								}
								let name = target.name;
								if (lib.translate[name + '_ab']) {
									return lib.translate[name + '_ab'];
								}
								return get.translation(name);
							})(target);
							dialog.buttons.remove(button);
							break;
						}
					}
					const capt = get.translation(target) + '选择了' + get.translation(button.link);
					if (card) {
						target.gain(card, 'visible');
						target.$gain2(card);
						game.broadcast(
							function (card, id, name, capt) {
								const dialog = get.idDialog(id);
								if (dialog) {
									dialog.content.firstChild.innerHTML = capt;
									for (let i = 0; i < dialog.buttons.length; i++) {
										if (dialog.buttons[i].link == card) {
											dialog.buttons[i].querySelector('.info').innerHTML = name;
											dialog.buttons.splice(i--, 1);
											break;
										}
									}
								}
							},
							card,
							dialog.videoId,
							(function (target) {
								if (target._tempTranslate) {
									return target._tempTranslate;
								}
								let name = target.name;
								if (lib.translate[name + '_ab']) {
									return lib.translate[name + '_ab'];
								}
								return get.translation(name);
							})(target),
							capt,
						);
					}
					dialog.content.firstChild.innerHTML = capt;
					game.addVideo('dialogCapt', null, [dialog.videoId, dialog.content.firstChild.innerHTML]);
					game.log(target, '选择了', button.link);
				});
				next;
			}
			('step 2');
			for (let i = 0; i < ui.dialogs.length; i++) {
				if (ui.dialogs[i].videoId == event.dialog.videoId) {
					const dialog = ui.dialogs[i];
					dialog.close();
					_status.dieClose.remove(dialog);
					if (dialog.buttons.length) {
						event.remained = [];
						for (let i = 0; i < dialog.buttons.length; i++) {
							event.remained.push(dialog.buttons[i].link);
						}
						event.trigger('sgsk_wuguDiscard');
					}
					break;
				}
			}
			game.broadcast(function (id) {
				const dialog = get.idDialog(id);
				if (dialog) {
					dialog.close();
					_status.dieClose.remove(dialog);
				}
			}, event.dialog.videoId);
			game.addVideo('cardDialog', null, event.dialog.videoId);
			('step 3');
			if (player.countCards('h') == 0) {
				player.recover();
			}
		},
		ai: {
			order: 1,
			result: {
				player(player) {
					const num1 = player.countCards('h');
					const num2 = game.countPlayer((c) => c != player);
					if (num1 > num2) {
						return false;
					}
					let num = 0;
					num += player.getDamagedHp(true);
					num /= player.countCards('h');
					return num - 1.5;
				},
			},
		},
	},
	sgsk_changcao: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		content() {
			'step 0';
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
			('step 1');
			game.addVideo('deletenode', player, [get.cardInfo(event.node)]);
			event.node.delete();
			game.broadcast(function (card) {
				ui.arena.classList.remove('thrownhighlight');
				if (card.clone) {
					card.clone.delete();
				}
			}, event.card);
			player.gain(event.card, 'gain2');
			if (event.card.suit == 'spade') {
				player.loseHp();
			}
		},
		ai: {
			order: 10,
			result: {
				player(player) {
					return player.hp - 1.5;
				},
			},
		},
	},
	sgsk_changcaox: {
		audio: 'sgsk_changcao',
		inherit: 'sgsk_changcao',
		usable(skill, player) {
			return player.hp;
		},
	},

	sgsk_xiude: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['useCardAfter', 'respondAfter'],
		},
		filter(event, player) {
			return get.type(event.card) == 'basic';
		},
		chect() {
			return true;
		},
		content() {
			'step 0';
			player
				.judge(function (card) {
					if (get.type(card) == 'basic') {
						return 1;
					}
					return -1;
				})
				.set('judge2', function (result) {
					return result.bool;
				});
			('step 1');
			if (result.bool) {
				let next = player.chooseTarget('令一名角色摸一张牌');
				next.set('ai', function (target) {
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
			('step 2');
			if (result.bool) {
				player.line(target, 'green');
				result.targets[0].draw();
			}
		},
	},
	sgsk_xiudex: {
		audio: 'sgsk_xiude',
		trigger: {
			player: ['useCardAfter', 'respondAfter'],
		},
		filter(event, player) {
			return get.type(event.card) == 'basic';
		},
		chect() {
			return true;
		},
		content() {
			'step 0';
			player
				.judge(function (card) {
					if (get.type(card) == 'basic') {
						return 1;
					}
					return -1;
				})
				.set('judge2', function (result) {
					return result.bool;
				});
			('step 1');
			if (result.bool) {
				let next = player.chooseTarget('与一名角色各摸一张牌');
				next.set('ai', function (target) {
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
			('step 2');
			if (result.bool) {
				player.line(target, 'green');
				player.draw();
				result.targets[0].draw();
			}
		},
	},
	sgsk_xiudey: {
		audio: 'sgsk_xiude',
		trigger: {
			player: ['useCardAfter', 'respondAfter'],
		},
		filter(event, player) {
			return true;
		},
		chect() {
			return true;
		},
		content() {
			'step 0';
			player
				.judge(function (card) {
					if (get.type2(card) == get.type2(trigger.card)) {
						return 1;
					}
					return -1;
				})
				.set('judge2', function (result) {
					return result.bool;
				});
			('step 1');
			if (result.bool) {
				let next = player.chooseTarget('令一名角色摸一张牌');
				next.set('ai', function (target) {
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
			('step 2');
			if (result.bool) {
				player.line(target, 'green');
				result.targets[0].draw();
			}
		},
	},
	sgsk_xiudexy: {
		audio: 'sgsk_xiude',
		trigger: {
			player: ['useCardAfter', 'respondAfter'],
		},
		filter(event, player) {
			return true;
		},
		chect() {
			return true;
		},
		content() {
			'step 0';
			player
				.judge(function (card) {
					if (get.type2(card) == get.type2(trigger.card)) {
						return 1;
					}
					return -1;
				})
				.set('judge2', function (result) {
					return result.bool;
				});
			('step 1');
			if (result.bool) {
				let next = player.chooseTarget('与一名角色摸一张牌');
				next.set('ai', function (target) {
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
			('step 2');
			if (result.bool) {
				player.line(target, 'green');
				player.draw();
				result.targets[0].draw();
			}
		},
	},
	sgsk_wending: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'equipEnd',
		},
		forced: true,
		filter(event, player) {
			for (let i = 1; i < 6; i++) {
				if (player.hasEmptySlot(i)) {
					return false;
				}
			}
			let cards = player.getCards('e');
			if (cards) {
				let num = get.YB_suit(cards, 'suit');
			} else {
				return false;
			}
			return num == 4;
		},
		content() {
			const winners = player.getFriends();
			game.over(player == game.me || winners.includes(game.me));
		},
	},

	sgsk_qiongsang: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseUseEnd',
		},
		filter(event, player) {
			if (player.countCards('h')) {
				return false;
			}
			const history = player.getHistory('useCard');
			for (let i = 0; i < history.length; i++) {
				if (history[i].isPhaseUsing()) {
					return true;
				}
			}
			return false;
		},
		forced: true,
		content() {
			player
				.when('phaseJieshuBegin')
				.then(function () {
					player
						.chooseBool()
						.set('ai', function () {
							return true;
						})
						.set('prompt', '是否摸三张牌并回复1点体力？');
				})
				.then(function () {
					if (result.bool) {
						player.draw(3);
						player.recover();
					}
				});
		},
	},
	sgsk_qiongsangx: {
		audio: 'sgsk_qiongsang',
		inherit: 'sgsk_qiongsang',
		trigger: {
			player: 'loseAfter',
			global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		filter(event, player) {
			if (!player.isPhaseUsing()) {
				return false;
			}
			if (player.countCards('h')) {
				return false;
			}
			let evt = event.getl(player);
			return evt && evt.hs && evt.hs.length;
		},
	},
	sgsk_qiongsangy: {
		audio: 'sgsk_qiongsang',
		inherit: 'sgsk_qiongsang',
		filter(event, player) {
			if (player.countCards('h')) {
				return false;
			}
			return true;
		},
	},

	sgsk_chuangzhi: {
		audio: 'ext:夜白神略/audio/character:2',
	},

	sgsk_longxiao: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: ['chooseToRespond', 'chooseToUse'],
		filter(event, player) {
			if (!player.countCards('hes', { type: 'basic' })) {
				return false;
			}
			let evt = lib.filter.filterCard;
			for (const i of lib.inpile) {
				let type = get.type(i);
				if (type == 'basic' && evt({ name: i }, player, event)) {
					return true;
				}
			}
			return false;
		},
		hiddenCard(player, name) {
			let type = get.type(name);
			return type == 'basic';
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];

				for (let i = 0; i < lib.inpile.length; i++) {
					if (get.type(lib.inpile[i]) == 'basic') {
						list.push(['基本', '', lib.inpile[i], null]);
						if (lib.inpile[i] == 'sha') {
							for (const k of get.YB_natureList()) {
								list.push(['基本', '', lib.inpile[i], k]);
							}
							list.push(['基本', '', lib.inpile[i], 'kami']);
						}
					}
				}
				const dialog = ui.create.dialog('龙啸', [list, 'vcard'], 'hidden');
				dialog.direct = true;
				return dialog;
			},
			filter(button, player) {
				return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
			},
			backup(links, player) {
				return {
					filterCard(card, player) {
						return get.type2(card) == 'basic';
					},
					position: 'hes',
					check(card) {
						const val = get.value(card);
						if (_status.event.name == 'chooseToRespond') {
							return 1 / Math.max(0.1, val);
						}
						return 5 - val;
					},
					viewAs: {
						name: links[0][2],
						nature: links[0][3],
					},
					precontent() { },
				};
			},
			prompt(links, player) {
				return '龙啸:将一张基本牌当【' + links[0][3] ? get.translation(links[0][3]) : '' + get.translation(links[0][2]) + '】使用或打出';
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

	sgsk_huwei: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		mod: {
			selectTarget(card, player, range) {
				if (!card.suit || card.suit != 'club') {
					return;
				}
				if (Array.isArray(range) && range[1] == -1) {
					return;
				}
				range[1]++;
			},
		},
		trigger: {
			player: 'useCard',
		},
		filter(event, player) {
			const suitx = event.card.suit;
			if (suitx == 'spade') {
				return true;
			}
			if (suitx == 'club') {
				return lib.filter.selectTarget(event.card, player)[1] != -1;
			}
		},
		content() {
			const suit = trigger.card.suit;
			if (suit == 'spade') {
				trigger.baseDamage++;
			}
		},
	},

	sgsk_zhiyan: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	sgsk_zhiyanx: {
		audio: 'sgsk_zhiyan',
		forced: true,
		mod: {
			cardnature(card, player) {
				if (card.name == 'sha') {
					return 'fire';
				}
				if (card.type == 'trick' && lib.card[card.name] && lib.card[card.name].ai && lib.card[card.name].ai.tag && lib.card[card.name].ai.tag.damage) {
					return 'fire';
				}
			},
			cardname(card, player) {
				if (card.type == 'trick' && lib.card[card.name] && lib.card[card.name].ai && lib.card[card.name].ai.tag && lib.card[card.name].ai.tag.damage) {
					if (card.name == 'wanjian') {
						return 'ybsl_meteor';
					}
					return 'huogong';
				}
			},
		},
		group: ['sgsk_zhiyanx_liuxing', 'sgsk_zhiyanx_fire'],
		subSkill: {
			liuxing: {},
			fire: {
				forced: true,
				trigger: {
					player: 'damageBegin4',
					source: 'damageAfter',
				},
				filter(event, player, name) {
					return event.hasNature('fire');
				},
				content() {
					if (event.triggername == 'damageAfter') {
						player.draw();
					} else {
						trigger.cancel();
					}
				},
			},
		},
	},
	sgsk_zhiyany: {
		audio: 'sgsk_zhiyan',
		forced: true,
		mod: {
			cardnature(card, player) {
				if (card.name == 'sha') {
					return 'fire';
				}
			},
		},
		trigger: {
			player: 'useCardToBegin',
		},
		filter(event, player) {
			if (get.type(event.card) != 'trick') {
				return false;
			}
			if (event.card.name == 'wuxie') {
				return false;
			}
			if (!event.targets) {
				return false;
			}
			return true;
		},
		firstDo: true,
		async content(event, trigger, player) {
			trigger.setContent(lib.card.ybsl_meteor.content);
		},
		group: ['sgsk_zhiyanx_fire'],
	},

	sgsk_xuanzhen: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseZhunbeiBegin',
		},
		filter(event, player) {
			if (player.countDiscardableCards(player, 'h') > 0) {
				return true;
			}
			if (player.countDiscardableCards(player, 'e') > 0) {
				return true;
			}
			if (player.countDiscardableCards(player, 'j') > 0) {
				return true;
			}
			return false;
		},
		cost: async function (event, trigger, player) {
			event.result = { bool: false, cost_data: { control: 'cancel2' } };
			const listx = [];
			if (player.countDiscardableCards(player, 'h') > 0) {
				listx.push('手牌区');
			}
			if (player.countDiscardableCards(player, 'e') > 0) {
				listx.push('装备区');
			}
			if (player.countDiscardableCards(player, 'j') > 0) {
				listx.push('判定区');
			}
			if (listx.length >= 1) {
				const cont = await player
					.chooseControl(listx, 'cancel2')
					.set('prompt', '是否发动玄震？你可以弃置一个区域的所有牌,然后摸等量的牌')
					.set('ai', function () {
						return '判定区';
					})
					.forResult();
				event.result.bool = typeof cont.control === 'string' && cont.control !== 'cancel2';
				event.result.cost_data.control = cont.control;
			}
		},
		content: async function (event, trigger, player) {
			const result = event.cost_data;
			if (result.control == 'cancel2') {
				event.finish();
			} else {
				let por;
				if (result.control == '手牌区') {
					por = 'h';
				}
				if (result.control == '装备区') {
					por = 'e';
				}
				if (result.control == '判定区') {
					por = 'j';
				}
				let cards = player.getDiscardableCards(player, por);
				await player.discard(cards);
				await player.draw(cards.length);
			}
		},
	},

	sgsk_decai: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseUseBegin',
		},
		cost() {
			'step 0';
			event.result = { bool: false, cost_data: { target: null, control: null } };
			const targets1 = game.filterPlayer((c) => c.countCards('h') < player.countCards('h'));
			const targets2 = game.filterPlayer((c) => c.hp < player.hp);
			player
				.chooseTarget()
				.set('filterTarget', function (card, player, target) {
					let str = '';
					if (targets1.includes(target)) {
						str += '其可摸牌<br>';
					}
					if (targets2.includes(target) && target.getDamagedHp()) {
						str += '其可回血<br>';
					}
					target.prompt(str, 'wood');
					return targets1.includes(target) || targets2.includes(target);
				})
				.set('ai', function (target) {
					return get.attitude(_status.event.player, target) - 5 - target.hp - target.countCards('h');
				});
			('step 1');
			if (!result.bool) {
				event.result.bool = false;
				event.finish();
			} else {
				event.tar = result.targets[0];
				let list = [];
				if (event.tar.countCards('h') < player.countCards('h')) {
					list.push('令其摸牌');
				}
				if (event.tar.hp < player.hp && event.tar.getDamagedHp()) {
					list.push('令其回血');
				}
				list.push('回上一步');
				player.chooseControl(list).set('prompt2', '令' + get.translation(event.tar) + '怎么样？');
			}
			('step 2');
			if (result.control == '回上一步') {
				event.goto(0);
			} else {
				event.result = { bool: true, cost_data: { target: event.tar, control: result.control } };
			}
		},

		content() {
			'step 0';
			let result = event.cost_data;
			if (result.control == '令其摸牌') {
				result.target.draw();
			} else {
				result.target.recover();
			}
		},
	},
	sgsk_decaix: {
		audio: 'sgsk_decai',
		trigger: {
			player: 'phaseUseBegin',
		},
		cost() {
			const targets1 = game.filterPlayer((c) => c.countCards('h') < player.countCards('h'));
			const targets2 = game.filterPlayer((c) => c.hp < player.hp);
			event.result = player
				.chooseTarget()
				.set('filterTarget', function (card, player, target) {
					let str = '';
					if (targets1.includes(target)) {
						str += '其可摸牌<br>';
					}
					if (targets2.includes(target) && target.getDamagedHp()) {
						str += '其可回血<br>';
					}
					target.prompt(str, 'wood');
					return targets1.includes(target) || targets2.includes(target);
				})
				.set('ai', function (target) {
					return get.attitude(_status.event.player, target) - 5 - target.hp - target.countCards('h');
				});
		},
		content() {
			const tar = event.target;
			if (tar.countCards('h') < player.countCards('h')) {
				tar.draw();
			}
			if (tar.hp < player.hp) {
				tar.recover();
			}
		},
	},

	sgsk_baigong: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseDrawBefore',
			global: 'phaseDrawAfter',
		},
		forced: true,
		content() {
			if (trigger.player != player) {
				player.gainPlayerCard('he', trigger.player, true);
				if (game.countPlayer() <= 4 && trigger.player.countCards('he') > player.countCards('he')) {
					player.gainPlayerCard('he', trigger.player, true);
				}
			} else {
				trigger.cancel();
			}
		},
	},
	sgsk_cangling: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseUseAfter',
		},
		filter(event, player) {
			return (
				player.getHistory('useCard', function (evt) {
					if (evt.targets && evt.targets.length && evt.isPhaseUsing()) {
						const targets = evt.targets.slice(0);
						while (targets.includes(player)) {
							targets.remove(player);
						}
						return targets.length;
					}
					return false;
				}).length == 0
			);
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget('请选择一名角色令其增加1点体力上限,然后你回复1点体力')
				.set('ai', function (target) {
					return target == player;
				})
				.forResult();
		},
		content() {
			let target = event.targets[0];
			target.gainMaxHp();
			player.recover();
		},
	},

	sgsk_kunlun: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			target: 'useCardToTargeted',
		},
		filter(event, player) {
			return event.card && event.card.suit == 'spade';
		},
		content() {
			'step 0';
			player.draw(2);
			('step 1');
			if (!player.isDamaged()) {
				player.chooseToDiscard('he', 2, true);
			}
		},
	},
	sgsk_huasheng: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseUseAfter',
		},
		filter(event, player) {
			return true;
		},

		async cost(event, trigger, player) {
			event.result = await player
				.chooseCard('h', get.prompt('sgsk_huasheng'), '展示并视为使用一张基本牌或普通锦囊牌', function (card, player) {
					let type = get.type(card, player);
					return type == 'basic' || type == 'trick';
				})
				.set('ai', function (card) {
					let player = _status.event.player,
						name = card.name;
					if (name == 'jiu') {
						return 0;
					}
					return player.getUseValue({
						name: name,
						nature: get.nature(card, player),
					});
				})
				.forResult();
		},
		content() {
			const cardv = event.cards[0];
			player.showCards(cardv, get.translation(player) + '发动了【化生】');
			let card = {
				name: cardv.name,
				nature: get.nature(cardv, player),
			};
			player.chooseUseTarget(card, true, false);
		},
	},

	sgsk_talei: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseZhunbeiBegin',
		},
		check(event, player) {
			return get.attitude(player, event.player) <= 0;
		},
		content() {
			trigger.player.executeDelayCardEffect('shandian');
		},
		ai: {
			expose: 1,
			threaten: 0.5,
		},
	},
	sgsk_yunyuu: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'judgeEnd',
		},
		preHidden: true,
		forced: true,
		filter(event, player) {
			return event.result.card.suit == 'heart';
		},
		content() {
			player.draw(1);
		},
	},

	sgsk_yunyu: {
		audio: 'ext:夜白神略/audio/character:2',
		group: ['sgsk_yunyu_1', 'sgsk_yunyu_2'],
		subSkill: {
			1: {
				audio: 'sgsk_yunyu',
				trigger: {
					player: 'damageAfter',
				},
				filter(event, player) {
					return true;
				},
				cost() {
					event.result = player
						.chooseTarget()
						.set('ai', function (target) {
							return (get.attitude(_status.event.player, target) - 5) * target.getDamagedHp(true);
						})
						.set('prompt2', '是否令一名男性角色回复1点体力？')
						.set('filterTarget', function (card, player, target) {
							return target.hasSex('male') && target.isDamaged();
						})
						.forResult();
				},
				content() {
					event.targets[0].recover();
				},
			},
			2: {
				audio: 'sgsk_yunyu',
				trigger: {
					global: 'damageAfter',
				},
				filter(event, player) {
					return event.player.hasSex('male') && player.isDamaged();
				},
				cost() {
					event.result = trigger.player
						.chooseBool()
						.set('ai', function () {
							return get.attitude(_status.event.player, player) > 5;
						})
						.set('prompt', '是否令' + get.translation(player) + '回复1点体力？')
						.forResult();
				},
				content() {
					player.recover();
				},
			},
		},
	},
	sgsk_mengzhen: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseJieshuBegin',
		},
		check(event, player) {
			if (game.countPlayer() > 4) {
				return true;
			}
			return event.player.hp + player.countCards('h') < 4;
		},
		async content(event, trigger, player) {
			const num = game.countPlayer();
			await player.turnOver();
			await player.draw(num);
		},
	},

	sgsk_pudu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseDrawBefore',
		},
		filter() {
			return true;
		},
		content() {
			trigger.changeToZero();
			const tars = game.filterPlayer().sortBySeat();
			for (const i of tars) {
				i.draw();
			}
		},
	},
	sgsk_xiansheng: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,

		filter(event, player) {
			const players = game.filterPlayer((c) => c != player);
			for (const i of players) {
				if (i.isMaxHandcard()) {
					return true;
				}
			}
		},
		filterTarget(card, player, target) {
			return target != player && target.isMaxHandcard();
		},
		content() {
			'step 0';
			let num = get.YB_cardMaxLose(target);
			player.choosePlayerCard(target, 'h', true, num);
			('step 1');
			if (result.links) {
				player.gain(result.links, 'gain2');
			}
		},
		ai: {
			order(item, player) {
				return 6 - player.countCards('h');
			},
			result: {
				player: 10,
				target: -10,
			},
		},
	},
	sgsk_xianshengx: {
		audio: 'sgsk_xiansheng',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			const players = game.filterPlayer((c) => c != player);
			for (const i of players) {
				if (i.isMaxHandcard()) {
					return true;
				}
			}
		},
		filterTarget(card, player, target) {
			return target != player && target.isMaxHandcard();
		},
		content() {
			'step 0';
			event.count = 0;
			('step 1');
			player.choosePlayerCard(target, 'h', true);
			('step 2');
			if (result.links) {
				player.gain(result.links, 'gain2');
				event.count++;
			} else {
				event.finish();
			}
			('step 3');
			if (event.count >= 5 || !target.isMaxHandcard()) {
				event.finish();
			} else {
				event.goto(1);
			}
		},
		ai: {
			order(item, player) {
				return 6 - player.countCards('h');
			},
			result: {
				player: 10,
				target: -10,
			},
		},
	},

	sgsk_taotian: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter() {
			return true;
		},
		filterCard(card, player) {
			const player = _status.event.player;
			const mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
			if (mod2 != 'unchanged') {
				return mod2;
			}
			const mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
			if (mod != 'unchanged') {
				return mod;
			}
			return true;
		},
		check(card) {
			return 6 - get.value(card);
		},
		discard: false,
		lose: false,
		content() {
			const suit = cards[0].suit;
			('step 0');
			player.respond(cards[0], 'highlight', 'noOrdering');
			('step 1');
			const targets = game.filterPlayer((c) => c != player).sortBySeat();
			for (const i of targets) {
				let next = game.createEvent('sgsk_taotian_next', false);
				next.player = player;
				next.target = i;
				next.card = cards[0];
				next.suit = suit;
				next.setContent(function () {
					'step 0';
					target
						.chooseToRespond('请打出一张非' + get.translation(event.suit) + '牌,否则' + get.translation(player) + '摸一张牌', function (card, player) {
							const suitx = card.suit;
							return suitx != event.suit;
						})
						.set('ai', function (card) {
							if (get.attitude(_status.event.player, player) > 5) {
								return false;
							}
							return -get.value(card, target);
						});
					('step 1');
					if (!result.bool) {
						player.draw();
					}
				});
			}
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
	},

	sgsk_fentian: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		selectCard: -1,
		filterCard: false,
		check(event, player) {
			let cards = player.getCards('h');
			const list2 = [];
			for (const k of cards) {
				if (get.color(k) != 'red') {
					return false;
				}
			}
			return true;
		},
		lose: false,
		discard: false,
		delay: false,
		async content(event, trigger, player) {
			let cards = player.getCards('h');
			await player.showCards(cards);
			const list2 = [];
			for (const k of cards) {
				if (get.color(k) != 'red') {
					return false;
				}
				if (list2.length == 0 || !list2.includes(get.color(k))) {
					list2.add(get.color(k));
				}
			}
			if (list2.length == 1 && list2[0] == 'red') {
				const relu = await player
					.chooseTarget('选择至多' + cards.length + '名角色,对其各造成1点火焰伤害')
					.set('ai', function (target) {
						return -get.attitude(_status.event.player, target);
					})
					.forResult();
				if (relu.bool) {
					const tars = relu.targets;
					player.line(tars);
					const targets = tars;
					for (const i of targets) {
						let next = game.createEvent('sgsk_fentian_next', false);
						next.player = player;
						next.target = i;
						next.setContent(function () {
							target.damage('fire');
						});
					}
				}
			}
		},
	},

	sgsk_fusang: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseUseBegin',
		},
		filter(event, player) {
			return !player.isMaxHandcard();
		},
		content() {
			let num = 1;
			game.filterPlayer(function (c) {
				if (c.isMaxHandcard()) {
					num = c.countCards('h');
				}
			});
			player.draw(num - player.countCards('h'));
		},
		check: () => true,
	},
	sgsk_mangtong: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['changeHp'],
		},
		forced: true,
		content() {
			event.num = Math.abs(trigger.num);
			if (trigger.num > 0) {
				player.draw(event.num);
			} else {
				player.chooseToDiscard(event.num, true, 'he');
			}
		},
	},
	sgsk_mangtongx: {
		audio: 'sgsk_mangtong',
		inherit: 'yb018_zheye',
	},
	sgsk_mushen: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		mark: true,
		limited: true,
		init(player) {
			player.storage.sgsk_mushen = false;
		},
		filter(event, player) {
			if (!player.countCards('h')) {
				return false;
			}
			if (player.storage.sgsk_mushen) {
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
		check(event, player) {
			return (
				player.countCards('h', function (c) {
					return c.suit == 'club';
				}) > 0
			);
		},
		content() {
			'step 0';
			player.awakenSkill('sgsk_mushen');
			player.storage.sgsk_mushen = true;
			event.cards = player.getCards('h').filter((c) => c.suit == 'club');
			('step 1');
			player.discard(player.getCards('h'));
			('step 2');
			if (event.cards.length) {
				player.recover(event.cards.length);
			}
			('step 3');
			player.turnOver(false);
			player.link(false);
		},
	},
	sgsk_mushenx: {
		audio: 'sgsk_mushen',
		enable: 'chooseToUse',
		mark: true,
		limited: true,
		init(player) {
			player.storage.sgsk_mushenx = false;
		},
		check(event, player) {
			return (
				player.countCards('h', function (c) {
					return c.suit == 'club';
				}) > 0
			);
		},
		filter(event, player) {
			if (!player.countCards('h')) {
				return false;
			}
			if (player.storage.sgsk_mushenx) {
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
			player.awakenSkill('sgsk_mushenx');
			player.storage.sgsk_mushenx = true;
			event.cards = player.getCards('h').filter((c) => c.suit == 'club');
			('step 1');
			player.discard(player.getCards('h'));
			('step 2');
			if (event.cards.length) {
				player.YB_recover(event.cards.length);
			}
			('step 3');
			player.turnOver(false);
			player.link(false);
		},
	},

	sgsk_yutu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'damageAfter',
		},
		filter(event, player) {
			return true;
		},
		check() {
			return true;
		},
		content() {
			let num = 0;
			if (!player.countCards('h')) {
				num++;
			}
			if (!player.countCards('e')) {
				num++;
			}
			if (!player.countCards('j')) {
				num++;
			}
			if (num <= 0) {
				num = 1;
			}
			player.draw(num);
		},
	},
	sgsk_yutux: {
		audio: 'sgsk_yutu',
	},
	sgsk_shengtu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		filterCard(card, player) {
			return get.type(card) == 'equip';
		},
		position: 'hes',
		viewAs: { name: 'wuzhong' },
		viewAsFilter(player) {
			if (
				!player.countCards('hes', function (card) {
					return get.type(card) == 'equip';
				})
			) {
				return false;
			}
		},
		prompt: '将一张装备牌当无中生有使用',
		check(card) {
			return 4 - get.value(card);
		},
	},

	sgsk_zhihai: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { global: 'phaseBegin' },
		filter(event, player) {
			const tar = event.player;
			if (player == tar) {
				return false;
			}
			return true;
		},
		content() {
			'step 0';
			player.storage.sgsk_zhihai_list = ui.cardPile;
			player.storage.sgsk_zhihai_list2 = ui.discardPile;
			('step 1');
			ui.cardPile = player.storage.sgsk_zhihai_list2;
			ui.discardPile = player.storage.sgsk_zhihai_list;
		},
	},
	sgsk_xuanming: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { global: 'phaseAfter' },
		filter(event, player) {
			return true;
		},
		content() {
			'step 0';
			const discarded = get.discarded();
			if (discarded.length) {
				let next = player.chooseToMove();
				next.set('list', [['弃牌堆顶(翻过来后就是牌堆底)', discarded], ['弃牌堆底(翻过来后就是牌堆顶)']]);
				next.set('prompt', '玄冥:选择任意张牌,以任意顺序置于弃牌堆底(翻过来之后就成了牌堆顶)').set('processAI', function (list) {
					let player = _status.event.player,
						cards = list[0][1].sort(function (a, b) {
							return get.useful(a) - get.useful(b);
						}),
						cards2 = cards.splice(0, Math.ceil(discarded.length / 2));
					return [cards2, cards];
				});
			} else {
				event.finish();
			}
			('step 1');

			if (result.moved) {
				const top = result.moved[1];
				let bottom = result.moved[0];
				top.reverse();
				for (let i = 0; i < top.length; i++) {
					ui.discardPile.insertBefore(top[i], ui.discardPile.firstChild);
				}
				for (let i = 0; i < bottom.length; i++) {
					ui.discardPile.appendChild(bottom[i]);
				}
				player.popup(get.cnNumber(top.length) + '上' + get.cnNumber(bottom.length) + '下');
				game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');
				game.updateRoundNumber();
			}
		},
	},

	sgsk_yuhan: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'damageAfter',
		},
		filter(event, player) {
			return true;
		},
		cost() {
			event.result = player.chooseToDiscard('he').set('prompt', get.prompt('sgsk_yuhan')).set('chooseonly', true).forResult();
		},
		content() {
			'step 0';
			player.discard(event.cards);
			('step 1');
			player.recover();
		},
	},
	sgsk_jiabian: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'judge',
		},
		audio: true,
		forced: true,
		lastDo: true,
		content() {
			'step 0';
			let card = trigger.player.judging[0];
			const judge0 = trigger.judge(card);
			let judge1 = 0;
			let choice = 'cancel2';
			event.suitchoice = 'cancel2';
			const attitude = get.attitude(player, trigger.player);
			let list = [];
			event.suitx = ['heart', 'diamond', 'club', 'spade'];
			for (let x = 0; x < 4; x++) {
				for (let i = 1; i < 14; i++) {
					list.add(i);
					const judge2 =
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

	sgsk_jiushou: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: 'dying' },
		forced: true,

		content() {
			'step 0';
			player.loseMaxHp();
			('step 1');
			let num = player.maxHp - player.hp;
			if (num > 0) {
				player.recover(num);
			}
		},
		ai: { halfneg: true },
	},

	sgsk_sheri: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		mod: {
			targetInRange(card, player, target, now) {
				let name = card.name;
				if (name == 'sha') {
					return true;
				}
			},
		},
		trigger: { player: 'useCardToTargeted' },
		logTarget: 'target',
		check(event, player) {
			return get.attitude(player, event.target) <= 0;
		},
		filter(event, player) {
			if (event.card.name != 'sha') {
				return false;
			}
			return true;
		},
		async content(event, trigger, player) {
			if (!player.inRange(trigger.target)) {
				trigger.parent.directHit.push(trigger.target);
			} else {
				const id = trigger.target.playerid;
				const map = trigger.parent.customArgs;
				if (!map[id]) {
					map[id] = {};
				}
				if (typeof map[id].extraDamage != 'number') {
					map[id].extraDamage = 0;
				}
				map[id].extraDamage++;
			}
		},
	},

	sgsk_zhishui: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'phaseUse',
		selectTarget(event, player) {
			let num = player.hp;
			return [1, num];
		},
		content() {
			'step 0';
			let cards = target.getCards('he');
			event.num = cards.length;
			target.discard(cards);
			('step 1');
			target.draw(event.num);
		},
	},

	sgsk_zhuiri: {
		audio: 'ext:夜白神略/audio/character:2',
		group: ['sgsk_zhuiri_summer'],

		forced: true,
		mod: {
			globalFrom(from, to, distance) {
				if (_status.currentPhase == from) {
					return distance - from.storage.sgsk_zhuiri;
				}
			},
		},
		init(player) {
			player.storage.sgsk_zhuiri = 0;
			player.markSkill('sgsk_zhuiri');
		},
		trigger: {
			player: 'phaseJieshuBefore',
		},
		filter(trigger, player) {
			return !game.hasPlayer(function (current) {
				return get.distance(player, current) > 1;
			});
		},
		marktext: '追',
		intro: {
			content(event, player, storage, name, skill) {
				const storage = player.storage.sgsk_zhuiri;
				return '计算至其他角色的距离-' + storage;
			},
		},
		content() {
			const winners = player.getFriends();
			game.over(player == game.me || winners.includes(game.me));
		},
		subSkill: {
			summer: {
				trigger: { player: ['phaseAfter', 'useCard'] },
				silent: true,
				filter(event, player) {
					let evt = event.getParent('phaseUse');
					if (!evt || evt.player != player) {
						return player == _status.currentPhase;
					}
					return true;
				},
				content() {
					if (trigger.name == 'phase') {
						player.storage.sgsk_zhuiri = 0;
						return;
					} else if (event.triggername == 'useCard') {
						player.storage.sgsk_zhuiri++;
						return;
					}
				},
			},
		},
	},
	sgsk_zhuirix: {
		inherit: 'sgsk_zhuiri',
		audio: 'sgsk_zhuiri',
		content() {
			let num = game.countPlayer();
			player.draw(num || 1);
		},
	},

	sgsk_xuemu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'damageAfter',
		},
		getIndex(event, player) {
			return event.num;
		},
		cost() {
			event.result = player
				.chooseToDiscard('he', [1, Infinity])
				.set('filterCard', function (card) {
					return get.color(card) == 'red';
				})
				.set('prompt2', get.prompt2('sgsk_xuemu'))
				.set('chooseonly', true)
				.forResult();
		},
		content() {
			'step 0';
			player.discard(event.cards);
			('step 1');
			player.draw(event.cards.length * 2);
		},
	},
	sgsk_jiuqu: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		mod: {
			maxHandcardBase(player, num) {
				return 9;
			},
		},
	},

	sgsk_xianmu: {
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
			let cards = event.cards.filter((i) => get.position(i, true) == 'd');
			if (cards.length) {
				return true;
			}
			return false;
		},
		async cost(event, trigger, player) {
			const dialog = ui.create.dialog('衔木');
			dialog.addText('选择一张获得或置入任意装备栏');
			dialog.add(trigger.cards.filter((i) => get.position(i, true) == 'd'));
			dialog.add([['获得', '武器', '防具', '防马', '攻马', '宝物', '双格马'], 'tdnodes']);
			event.result = await player
				.chooseButton(dialog, 2)
				.set('filterButton', function (button) {
					let type = typeof button.link;
					if (ui.selected.buttons.length && type == typeof ui.selected.buttons[0].link) {
						return false;
					}
					return true;
				})
				.set('ai', function (button) {
					let type = typeof button.link;
					if (type == 'string') {
						return '获得';
					} else {
						return get.value(button.link);
					}
				})
				.forResult();
			event.result.cost_data = event.result.links;
		},
		async content(event, trigger, player) {
			let links = event.cost_data;
			if (typeof links[0] == 'string') {
				links = [links[1], links[0]];
			}
			let type = null;

			const sub = ['武器', '防具', '防马', '攻马', '宝物', '双格马'];
			type = sub.includes(links[1]) ? 'equip'.concat(sub.indexOf(links[1]) + 1) : null;
			if (type == null) {
				await player.gain(links[0], 'gain2');
			} else {
				const card = links[0];
				card.subtypes = [type];
				await player.equip(card);
			}
		},
		group: 'sgsk_xianmu_pu',
		subSkill: {
			pu: {
				audio: 'sgsk_xianmu',
				trigger: {
					player: 'phaseUseBegin',
				},
				filter(event, player) {
					if (ui.discardPile.hasChildNodes()) {
						return true;
					}
					return false;
				},
				async cost(event, trigger, player) {
					const source = ui.discardPile.childNodes;
					let list = [];
					for (let i = 0; i < source.length; i++) {
						list.push(source[i]);
					}
					const dialog = ui.create.dialog('衔木');
					dialog.addText('选择一张获得或置入任意装备栏');
					dialog.add(list);
					dialog.add([['获得', '武器', '防具', '防马', '攻马', '宝物', '双格马'], 'tdnodes']);
					event.result = await player
						.chooseButton(dialog, 2)
						.set('filterButton', function (button) {
							let type = typeof button.link;
							if (ui.selected.buttons.length && type == typeof ui.selected.buttons[0].link) {
								return false;
							}
							return true;
						})
						.set('ai', function (button) {
							let type = typeof button.link;
							if (type == 'string') {
								return '获得';
							} else {
								return get.value(button.link);
							}
						})
						.forResult();
					event.result.cost_data = event.result.links;
				},
				async content(event, trigger, player) {
					let links = event.cost_data;
					if (typeof links[0] == 'string') {
						links = [links[1], links[0]];
					}
					let type = null;

					const sub = ['武器', '防具', '防马', '攻马', '宝物', '双格马'];
					type = sub.includes(links[1]) ? 'equip'.concat(sub.indexOf(links[1]) + 1) : null;
					if (type == null) {
						await player.gain(links[0], 'gain2');
					} else {
						const card = links[0];
						card.subtypes = [type];
						await player.equip(card);
					}
				},
			},
		},
	},
	sgsk_tianhai: {
		audio: 'ext:夜白神略/audio/character:2',
		usable(skill, player) {
			return player.countCards('e');
		},
		enable: 'chooseToUse',
		filter(event, player) {
			if (player.countCards('e') <= 0) {
				return false;
			}
			if (player.countCards('e', (c) => get.type(c) != 'equip') <= 0) {
				return false;
			}
			let evt = lib.filter.filterCard;
			let cards = player.getCards('e', (c) => get.type(c) != 'equip');
			for (const i of cards) {
				if (evt({ name: i.name }, player, event)) {
					return true;
				}
			}
			return false;
		},
		hiddenCard(player, name) {
			if (player.countCards('e') <= 0) {
				return false;
			}
			let cards = player.getCards('e', (c) => get.type(c) != 'equip');

			if (cards.length) {
				for (const i of cards) {
					if (i.name == name) {
						return true;
					}
				}
			}
		},
		chooseButton: {
			dialog(event, player) {
				let list = [];
				let cards = player.getCards('e', (c) => get.type(c) != 'equip');
				for (let i = 0; i < cards.length; i++) {
					list.push(['填海', '', cards[i].name, get.nature(cards[i])]);
				}
				const dialog = ui.create.dialog('填海', [list, 'vcard'], 'hidden');

				return dialog;
			},
			filter(button, player) {
				return _status.event.parent.filterCard({ name: button.link[2] }, player, _status.event.parent);
			},
			backup(links, player) {
				return {
					viewAs: {
						name: links[0][2],
						nature: links[0][3],
					},
					position: 'hs',
					selectCard: 1,
					filterCard(card, player) {
						return true;
					},
					precontent() { },
				};
			},
			prompt(links, player) {
				return '填海:将一张手牌当作【' + (links[0][3] ? get.translation(links[0][3]) : '') + get.translation(links[0][2]) + '】使用？';
			},
		},
	},

	sgsk_suwen: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: { player: 'taoBegin' },
		forced: true,
		content() {
			trigger.setContent(lib.skill.sgsk_suwen.taoContent);
		},
		taoContent() {
			'step 0';
			event.baseDamage = target.maxHp - target.hp;
			('step 1');
			target.recover();
		},
	},
	sgsk_lingjiu: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'chooseToUse',
		filterCard(card, player) {
			return get.type(card) == 'equip';
		},
		position: 'hes',
		viewAs: { name: 'tao' },
		viewAsFilter(player) {
			if (
				!player.countCards('hes', function (card) {
					return get.type(card) == 'equip';
				})
			) {
				return false;
			}
		},
		prompt: '将一张装备牌当桃使用',
		check(card) {
			return 4 - get.value(card);
		},
	},

	sgsk_yuefeng: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'phaseJieshuBefore',
		},
		filter(event, player) {
			return !event.numFixed;
		},
		forced: true,
		content() {
			player.YB_shelie(3, '乐风');
		},
		ai: {
			threaten: 1.2,
		},
	},
	sgsk_zhisheng: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'useCardAfter',
		},
		filter(event, player) {
			if (player.countCards('hes') == 0) {
				return false;
			}
			if (event.player != player && event.card.isCard && event.player.isPhaseUsing()) {
				return event.player.getHistory('useCard').indexOf(event) == player.hp - 1;
			}
		},
		check(event, player) {
			return get.attitude(player, event.player) < 0;
		},

		async cost(event, trigger, player) {
			event.result = await player.chooseToDiscard('he').set('prompt', get.prompt('sgsk_zhisheng')).forResult();
		},
		content() {
			let evt = _status.event.getParent('phaseUse');
			if (evt && evt.name == 'phaseUse') {
				evt.skipped = true;
				event.finish();
			}
		},
		ai: {
			result: {
				player: -0.5,
				target(target) {
					return -0.5 * Math.pow(target.countCards('h') - target.maxHandcard);
				},
			},
			threaten: 3,
			expose: 1,
		},
	},

	sgsk_cunyin: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'sgsk_sanqiuok',
		},
		filter() {
			return true;
		},
		content() {
			player.addMark('sgsk_cunyin', 1, false);
		},
		forced: true,

		mark: true,
		marktext: '阴',
		intro: {
			content: '攻击范围加$',
		},
	},
	sgsk_sanqiu: {
		audio: 'ext:夜白神略/audio/character:2',
		subSkill: {
			storage: {
				charlotte: true,
				mark: true,
				marktext: '秋',
				intro: {
					content: '本阶段已使用过$牌',
				},
			},
		},
	},
	sgsk_sanqiux: {
		audio: 'sgsk_sanqiu',
	},
	sgsk_sanqiuy: {
		audio: 'sgsk_sanqiu',
		trigger: { player: ['useCardAfter'] },
		filter(event, player) {
			let evt = event.getParent('phaseUse');
			if (!evt || evt.player != player) {
				return false;
			}
			return true;
		},
		nopop: true,
		cost() {
			if (!player.hasSkill('sgsk_sanqiu_storage')) {
				player.addTempSkill('sgsk_sanqiu_storage', { player: ['phaseUseAfter'] });
				player.storage.sgsk_sanqiu_storage = [];
			}
			if (!player.storage.sgsk_sanqiu_storage.includes(get.type2(trigger.card)) && ['trick', 'basic', 'equip'].includes(get.type2(trigger.card))) {
				player.storage.sgsk_sanqiu_storage.push(get.type2(trigger.card));
			}
			if (player.storage.sgsk_sanqiu_storage.length && player.storage.sgsk_sanqiu_storage.length == 3) {
				event.result = player
					.chooseBool(get.prompt2('sgsk_sanqiuy'))
					.set('ai', function () {
						return true;
					})
					.forResult();
			}
		},
		content() {
			'step 0';
			trigger.trigger('sgsk_sanqiuok');
			let evt = _status.event.getParent('phaseUse');
			if (evt && evt.name == 'phaseUse' && trigger.player.isPhaseUsing()) {
				evt.skipped = true;
			}
			player.when('phaseUseAfter').then(function () {
				player.draw(3);
				let next = player.phaseUse();
				event.next.remove(next);
				trigger.next.push(next);
			});
		},
	},

	sgsk_zongshuit: {
		audio: 'sgsk_zongshui',
	},
	sgsk_zongshui: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterCard(card, player) {
			const suit = card.suit;
			if (Array.isArray(ui.selected.cards))
				for (const i of ui.selected.cards) {
					if (i.suit == suit) {
						return false;
					}
				}
			return true;
		},
		selectCard: [1, Infinity],
		complexCard: true,
		filterTarget(card, player, target) {
			return player != target && target.countDiscardableCards(player, get.is.single() ? 'he' : 'hej');
		},
		selectTarget: [1, Infinity],
		content() {
			'step 0';
			player.discardPlayerCard(target, 'he', 1, true);
			('step 1');
			event.card = result.cards[0];
			event.cards = cards;
			for (const i of event.cards) {
				const t = i.suit;
				if (event.card.suit == t) {
					target.addTempSkill('sgsk_zongshui_mo');
				}
			}
		},
		check(card) {
			return 6 - get.value(card);
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
		subSkill: {
			mo: {
				mark: true,
				mod: {
					cardEnabled() {
						return false;
					},
					cardRespondable() {
						return false;
					},
					cardSavable() {
						return false;
					},
				},
				intro: {
					content: '不能使用或打出卡牌',
				},
			},
		},
	},

	sgsk_buyu: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseZhunbeiBegin',
		},
		check(event, player) {
			if (get.attitude(player, event.player) < -2) {
				let cards = player.getCards('h');
				if (cards.length > player.hp) {
					return true;
				}
				for (let i = 0; i < cards.length; i++) {
					const useful = get.useful(cards[i]);
					if (useful < 5) {
						return true;
					}
					if (cards[i].number > 9 && useful < 7) {
						return true;
					}
				}
			}
			return false;
		},
		logTarget: 'player',
		filter(event, player) {
			return player.canCompare(event.player);
		},
		content() {
			'step 0';
			player.chooseToCompare(trigger.player);
			('step 1');
			if (result.bool) {
				trigger.player.addTempSkill('sgsk_buyu2');
			}
		},
		ai: {
			threaten: 3,
			expose: 1,
		},
	},
	sgsk_hanshen: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: ['equipAfter', 'addJudgeAfter', 'loseAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
		},
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				let evt = event.getl(current);
				return evt && evt.hs && evt.hs.length && current.countCards('h') == 0;
			});
		},
		content() {
			player.draw();
		},
		ai: {
			threaten: 1.3,
			noh: true,
		},
	},
	sgsk_hanshenx: {
		preHidden: true,
		audio: 'sgsk_hanshen',
		trigger: {
			global: ['YB_anyEnd'],
		},
		forced: true,
		filter(event, player) {
			return game.hasPlayer(function (current) {
				return current.countCards('h') == 0;
			});
		},
		content() {
			player.draw();
		},
		ai: {
			threaten: 1.3,
		},
	},
	sgsk_buyu2: {
		audio: 'sgsk_buyu',
		trigger: {
			player: 'phaseDrawBefore',
		},
		forced: true,
		content() {
			trigger.cancel();
		},
	},

	sgsk_zhanshen: {
		audio: 'ext:夜白神略/audio/character:2',

		forced: true,
		trigger: {
			player: 'useCardAfter',
		},
		filter(event, player) {
			let evt = event.getParent('phaseUse');
			if (!evt || evt.player != player) {
				return false;
			}
			return true;
		},

		content() {
			'step 0';
			player.chooseTarget(true, '请选择对一名角色造成1点伤害').set('ai', function (target) {
				return get.damageEffect(target, player, player);
			});
			('step 1');
			if (result.bool) {
				result.targets[0].damage();
			}
		},
		group: 'sgsk_zhanshen_debuff',
		subSkill: {
			debuff: {
				trigger: { player: 'phaseAfter' },
				forced: true,
				filter(event, player) {
					return !player.getStat('kill') || player.getStat('kill') <= 0;
				},
				content() {
					player.damage();
				},
			},
		},
	},
	sgsk_shizhan: {},

	sgsk_sinan: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'judgeEnd',
		},
		filter(event, player) {
			return event.result.card.suit == 'heart';
		},
		content() {
			player.recover(1);
		},
	},
	sgsk_shence: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'damageEnd',
			source: 'damageSource',
		},
		filter(event, player) {
			return true;
		},
		async content(event, trigger, player) {
			let result = await player
				.judge(function (card) {
					if (get.type2(card) == 'trick') {
						return 2;
					}
					return -1;
				})
				.forResult();
			if (result && get.type2(result.card) == 'trick') {
				const result2 = await player
					.chooseTarget(1, true, '令一名角色翻面并摸两张牌')
					.set('ai', (target) => {
						if (target.hasSkillTag('noturn')) {
							return 0;
						}
						const player = _status.event.player;
						const current = _status.currentPhase;
						const dis = current ? get.distance(current, target, 'absolute') : 1;
						const draw = 2;
						const att = get.attitude(player, target);
						if (att == 0) {
							return target.hasJudge('lebu') ? Math.random() / 3 : Math.sqrt(get.threaten(target)) / 5 + Math.random() / 2;
						}
						if (att > 0) {
							if (target.isTurnedOver()) {
								return att + draw;
							}
							if (draw < 4) {
								return -1;
							}
							if (current && target.seatNum > current.seatNum) {
								return att + draw / 3;
							}
							return (10 * Math.sqrt(Math.max(0.01, get.threaten(target)))) / (3.5 - draw) + dis / (2 * game.countPlayer());
						} else {
							if (target.isTurnedOver()) {
								return att - draw;
							}
							if (draw >= 5) {
								return -1;
							}
							if (current && target.seatNum <= current.seatNum) {
								return -att + draw / 3;
							}
							return (4.25 - draw) * 10 * Math.sqrt(Math.max(0.01, get.threaten(target))) + (2 * game.countPlayer()) / dis;
						}
					})
					.forResult();
				if (result2.bool) {
					result2.targets[0].turnOver();
					result2.targets[0].draw(2);
				}
			}
		},
	},
	sgsk_shencex: {
		audio: 'sgsk_shence',
	},

	sgsk_taolue: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { player: ['phaseJieshuBegin', 'damageAfter'] },

		cost() {
			event.result = player
				.chooseTarget(get.prompt('zhiyan'), '令一名角色摸一张牌并展示之.若为♥️️️,其回复1点体力')
				.set('ai', function (target) {
					return get.attitude(_status.event.player, target) * (target.isDamaged() ? 2 : 1);
				})
				.forResult();
		},
		content() {
			'step 0';
			event.target = event.targets[0];
			player.line(event.target);
			event.target.draw('visible');
			('step 1');
			let card = result[0];
			if (card.suit == 'heart') {
				event.target.recover();
			}
		},
		ai: {
			expose: 0.2,
			threaten: 1.2,
		},
	},
	sgsk_xuanji: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCardAfter',
		},
		filter: (event, player) => player.isPhaseUsing() && event.cards.filterInD().length,
		async content(event, trigger, player) {
			const cards = trigger.cards.filterInD();
			if (!cards.length) {
				return;
			}
			let result = await player
				.chooseToMove()
				.set('list', [['牌堆顶', cards], ['牌堆底']])
				.set('prompt', '点击或拖动将牌移动到牌堆顶或牌堆底')
				.set('processAI', (list) => {
					let cards = list[0][1],
						player = _status.event.player,
						next = (_status.currentPhase || player).next,
						top = [];
					for (const card of cards) {
						if (player.hasCard((cardx) => get.tag(cardx, 'draw'))) {
							if (get.value(card) > 6.5) {
								top.add(card);
							}
						} else {
							if (get.attitude(player, next) > 0 && get.value(card) > 6.5) {
								top.add(card);
							}
							if (get.attitude(player, next) < 0 && get.value(card) < 5.5) {
								top.add(card);
							}
						}
					}
					if (_status.currentPhase == player && (!ui.cardPile.firstChild.isKnownBy(player) || ui.cardPile.firstChild.suit != 'heart')) {
						const heart = cards.filter((card) => card.suit == 'heart').sort((a, b) => get.value(b) - get.value(a))[0];
						if (heart) {
							top.remove(heart);
							top.unshift(heart);
						}
					}
					return [top, cards.removeArray(top)];
				})
				.forResult();
			const top = result.moved[0];
			let bottom = result.moved[1];
			top.reverse();
			for (let i = 0; i < top.length; i++) {
				ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
			}
			for (let i = 0; i < bottom.length; i++) {
				ui.cardPile.appendChild(bottom[i]);
			}
			event.result = {
				bool: true,
				moved: [top, bottom],
			};
			game.addCardKnower(top, player);
			game.addCardKnower(bottom, player);
			player.popup(get.cnNumber(top.length) + '上' + get.cnNumber(bottom.length) + '下');
			game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');
			game.updateRoundNumber();
		},
	},
	sgsk_xuanjix: {
		audio: 'sgsk_xuanji',
		trigger: {
			player: 'useCardAfter',
		},
		filter: (event, player) => player.isPhaseUsing() && event.cards.filterInD().length && !player.storage.sgsk_xuanjix_1?.includes(event.vard.name),
		async content(event, trigger, player) {
			const cards = trigger.cards.filterInD();
			if (!cards.length) {
				return;
			}
			let result = await player
				.chooseToMove()
				.set('list', [['牌堆顶', cards], ['牌堆底']])
				.set('prompt', '点击或拖动将牌移动到牌堆顶或牌堆底')
				.set('processAI', (list) => {
					let cards = list[0][1],
						player = _status.event.player,
						next = (_status.currentPhase || player).next,
						top = [];
					for (const card of cards) {
						if (player.hasCard((cardx) => get.tag(cardx, 'draw'))) {
							if (get.value(card) > 6.5) {
								top.add(card);
							}
						} else {
							if (get.attitude(player, next) > 0 && get.value(card) > 6.5) {
								top.add(card);
							}
							if (get.attitude(player, next) < 0 && get.value(card) < 5.5) {
								top.add(card);
							}
						}
					}
					if (_status.currentPhase == player && (!ui.cardPile.firstChild.isKnownBy(player) || ui.cardPile.firstChild.suit != 'heart')) {
						const heart = cards.filter((card) => card.suit == 'heart').sort((a, b) => get.value(b) - get.value(a))[0];
						if (heart) {
							top.remove(heart);
							top.unshift(heart);
						}
					}
					return [top, cards.removeArray(top)];
				})
				.forResult();
			const top = result.moved[0];
			let bottom = result.moved[1];
			top.reverse();
			for (let i = 0; i < top.length; i++) {
				ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
			}
			for (let i = 0; i < bottom.length; i++) {
				ui.cardPile.appendChild(bottom[i]);
			}
			event.result = {
				bool: true,
				moved: [top, bottom],
			};
			game.addCardKnower(top, player);
			game.addCardKnower(bottom, player);
			player.popup(get.cnNumber(top.length) + '上' + get.cnNumber(bottom.length) + '下');
			game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');
			game.updateRoundNumber();
			player.storage.sgsk_xuanjix_1 ??= [];
			player.storage.sgsk_xuanjix_1.add(trigger.card.name);
			player.addTempSkill('sgsk_xuanjix_1');
		},
		subSkill: {
			1: {
				charlotte: true,
			},
		},
	},
	sgsk_xuanjiy: {
		audio: 'sgsk_xuanji',
		trigger: {
			player: 'useCardAfter',
		},
		usable: 1,
		filter: (event, player) => event.cards.filterInD().length,
		async content(event, trigger, player) {
			const cards = trigger.cards.filterInD();
			if (!cards.length) {
				return;
			}
			let result = await player
				.chooseToMove()
				.set('list', [['牌堆顶', cards], ['牌堆底']])
				.set('prompt', '点击或拖动将牌移动到牌堆顶或牌堆底')
				.set('processAI', (list) => {
					let cards = list[0][1],
						player = _status.event.player,
						next = (_status.currentPhase || player).next,
						top = [];
					for (const card of cards) {
						if (player.hasCard((cardx) => get.tag(cardx, 'draw'))) {
							if (get.value(card) > 6.5) {
								top.add(card);
							}
						} else {
							if (get.attitude(player, next) > 0 && get.value(card) > 6.5) {
								top.add(card);
							}
							if (get.attitude(player, next) < 0 && get.value(card) < 5.5) {
								top.add(card);
							}
						}
					}
					if (_status.currentPhase == player && (!ui.cardPile.firstChild.isKnownBy(player) || ui.cardPile.firstChild.suit != 'heart')) {
						const heart = cards.filter((card) => card.suit == 'heart').sort((a, b) => get.value(b) - get.value(a))[0];
						if (heart) {
							top.remove(heart);
							top.unshift(heart);
						}
					}
					return [top, cards.removeArray(top)];
				})
				.forResult();
			const top = result.moved[0];
			let bottom = result.moved[1];
			top.reverse();
			for (let i = 0; i < top.length; i++) {
				ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
			}
			for (let i = 0; i < bottom.length; i++) {
				ui.cardPile.appendChild(bottom[i]);
			}
			event.result = {
				bool: true,
				moved: [top, bottom],
			};
			game.addCardKnower(top, player);
			game.addCardKnower(bottom, player);
			player.popup(get.cnNumber(top.length) + '上' + get.cnNumber(bottom.length) + '下');
			game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');
			game.updateRoundNumber();
		},
	},
	sgsk_xuanjiz: {
		audio: 'sgsk_xuanji',
	},

	sgsk_sangcan: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter: () => get.discarded().filterInD('d').length,
		async content(event, trigger, player) {
			player.draw(Math.min(get.discarded().filterInD('d').length, 5));
		},
		ai: {
			order() {
				if (get.discarded().filterInD('d').length >= 5) {
					return 10;
				}
				return 1;
			},
			result: {
				player: 1,
			},
		},
	},
	sgsk_bianjuan: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filterTarget: (card, player, target) => target.hasCard((card) => lib.filter.canBeDiscarded(card, player, target), 'e'),
		async content(event, trigger, player) {
			await player.discardPlayerCard(event.targets[0], 'e', true);
		},
		ai: {
			order: 7,
			result: {
				target: (player, target) => lib.card.guohe_copy.ai.result.target(player, target, { name: 'guohe_copy', position: 'e' }),
			},
		},
	},
	sgsk_bianjuanx: {
		audio: 'sgsk_bianjuan',
		enable: 'phaseUse',
		usable: 1,
		filterTarget: (card, player, target) => target.hasCard((card) => lib.filter.canBeDiscarded(card, player, target), 'e'),
		async content(event, trigger, player) {
			const target = event.targets[0];
			await player.discardPlayerCard(target, 'e', true);
			await game.asyncDraw([player, target].sortBySeat());
		},
		ai: {
			order: 7,
			result: {
				target: (player, target) => lib.card.guohe_copy.ai.result.target(player, target, { name: 'guohe_copy', position: 'e' }) + 1,
				player: 1,
			},
		},
	},
	sgsk_bianjuany: {
		audio: 'sgsk_bianjuan',
		enable: 'phaseUse',
		usable: 1,
		filterTarget: (card, player, target) => target.hasCard((card) => lib.filter.canBeDiscarded(card, player, target), 'ej'),
		async content(event, trigger, player) {
			const target = event.targets[0];
			await player.discardPlayerCard(target, 'ej', true);
			await game.asyncDraw([player, target].sortBySeat());
		},
		ai: {
			order: 7,
			result: {
				target: (player, target) => lib.card.guohe_copy.ai.result.target(player, target, { name: 'guohe_copy', position: 'ej' }) + 1,
				player: 1,
			},
		},
	},

	sgsk_zuoshu: {
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'chooseToUse',
		getUsed(player) {
			let list = [];
			player.getHistory('useCard', function (evt) {
				list.add(evt.card.name);
			});
			return list;
		},
		onChooseToUse(event) {
			if (game.online || event.sgsk_zuoshu_list) {
				return;
			}
			let list = lib.skill.sgsk_zuoshu.getUsed(event.player);
			event.set('sgsk_zuoshu_list', list);
		},
		hiddenCard(player, name) {
			let list = lib.skill.sgsk_zuoshu.getUsed(player);
			if (list.includes(name)) {
				return false;
			}

			return true;
		},
		filter(event, player) {
			if (
				!player.hasCard(function (card) {
					return get.color(card) == 'black' && get.type(card) != 'basic';
				}, 'hes')
			) {
				return false;
			}
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			for (const i of lib.inpile) {
				let type = get.type(i);
				if (evt({ name: i }, player, event)) {
					return true;
				}
			}
			let list = event.sgsk_zuoshu_list || lib.skill.sgsk_zuoshu.getUsed(player);
			for (let name of lib.inpile) {
				if (list.includes(name)) {
					continue;
				}
				let card = { name: name };
				if (event.filterCard && event.filterCard(card, player, event)) {
					return true;
				}
				if (name == 'sha') {
					for (const nature of get.YB_natureList()) {
						card.nature = nature;
						if (event.filterCard && event.filterCard(card, player, event)) {
							return true;
						}
					}
				}
			}
		},
		chooseButton: {
			dialog(event, player) {
				const vcards = [];
				let list = event.sgsk_zuoshu_list || lib.skill.sgsk_zuoshu.getUsed(player);
				for (let name of lib.inpile) {
					if (list.includes(name)) {
						continue;
					}
					let card = { name: name };
					if (event.filterCard && event.filterCard(card, player, event)) {
						vcards.push([get.type(name), '', name]);
					}
					if (name == 'sha') {
						for (const nature of get.YB_natureList()) {
							card.nature = nature;
							if (event.filterCard && event.filterCard(card, player, event)) {
								vcards.push([get.type(name), '', name, nature]);
							}
						}
					}
				}
				return ui.create.dialog('作书', [vcards, 'vcard'], 'hidden');
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
					check(card) {
						return 1 / Math.max(0.1, get.value(card));
					},
					filterCard(card) {
						return get.type(card) != 'basic' && get.color(card) == 'black';
					},
					viewAs: {
						name: links[0][2],
						nature: links[0][3],
					},
					position: 'hes',
					popname: true,

					precontent() { },
				};
			},
			prompt(links, player) {
				return '将一张黑色非基本牌当作' + get.translation(links[0][3] || '') + get.translation(links[0][2]) + '使用';
			},
		},
	},
	sgsk_zuoshux: {
		audio: 'sgsk_zuoshu',
		audio: 'ext:夜白神略/audio/character:2',
		usable: 1,
		enable: 'chooseToUse',
		getUsed(player) {
			let list = [];
			player.getHistory('useCard', function (evt) {
				list.add(evt.card.name);
			});
			return list;
		},
		onChooseToUse(event) {
			if (game.online || event.sgsk_zuoshu_list) {
				return;
			}
			let list = lib.skill.sgsk_zuoshu.getUsed(event.player);
			event.set('sgsk_zuoshu_list', list);
		},
		hiddenCard(player, name) {
			let list = lib.skill.sgsk_zuoshu.getUsed(player);
			if (list.includes(name)) {
				return false;
			}

			return true;
		},
		filter(event, player) {
			if (
				!player.hasCard(function (card) {
					return get.type(card) != 'basic';
				}, 'hes')
			) {
				return false;
			}
			let evt = lib.filter.filterCard;
			if (event.filterCard) {
				evt = event.filterCard;
			}
			for (const i of lib.inpile) {
				let type = get.type(i);
				if (evt({ name: i }, player, event)) {
					return true;
				}
			}
			let list = event.sgsk_zuoshu_list || lib.skill.sgsk_zuoshu.getUsed(player);
			for (let name of lib.inpile) {
				if (list.includes(name)) {
					continue;
				}
				let card = { name: name };
				if (event.filterCard && event.filterCard(card, player, event)) {
					return true;
				}
				if (name == 'sha') {
					for (const nature of get.YB_natureList()) {
						card.nature = nature;
						if (event.filterCard && event.filterCard(card, player, event)) {
							return true;
						}
					}
				}
			}
		},
		chooseButton: {
			dialog(event, player) {
				const vcards = [];
				let list = event.sgsk_zuoshu_list || lib.skill.sgsk_zuoshu.getUsed(player);
				for (let name of lib.inpile) {
					if (list.includes(name)) {
						continue;
					}
					let card = { name: name };
					if (event.filterCard && event.filterCard(card, player, event)) {
						vcards.push([get.type(name), '', name]);
					}
					if (name == 'sha') {
						for (const nature of get.YB_natureList()) {
							card.nature = nature;
							if (event.filterCard && event.filterCard(card, player, event)) {
								vcards.push([get.type(name), '', name, nature]);
							}
						}
					}
				}
				return ui.create.dialog('作书', [vcards, 'vcard'], 'hidden');
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
					check(card) {
						return 1 / Math.max(0.1, get.value(card));
					},
					filterCard(card) {
						return get.color(card) == 'black';
					},
					viewAs: {
						name: links[0][2],
						nature: links[0][3],
					},
					position: 'hes',
					popname: true,

					precontent() { },
				};
			},
			prompt(links, player) {
				return '将一张黑色牌当作' + get.translation(links[0][3] || '') + get.translation(links[0][2]) + '使用';
			},
		},
	},

	sgsk_qianjun: {
		audio: 'ext:夜白神略/audio/character:2',
		forced: true,
		trigger: {
			player: 'useCard',
		},
		filter(event, player) {
			return event.card && event.card.name == 'sha' && get.color(event.card);
		},
		async content(event, trigger, player) {
			if (get.color(trigger.card) == 'red') {
				trigger.baseDamage++;
			} else if (get.color(trigger.card) == 'black') {
				trigger.card.directHit = true;
			}
		},
	},

	sgsk_zhangu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseZhunbeiBegin',
		},
		async cost(event, trigger, player) {
			const target = trigger.player;
			event.result = await player
				.chooseToDiscard({ color: 'red' }, 'he')
				.set('prompt', `弃置一张红色牌,令${get.translation(target)}本回合出牌阶段使用的【杀】或【决斗】伤害+1`)
				.set('ai', (card) => {
					const player = get.player(),
						target = get.event().target;

					if (get.attitude(player, target) < 1.5) {
						return 0;
					}
					if (target.hasCard((cardx) => cardx.name == 'juedou')) {
						return 7 - get.value(card);
					}
					if (target.hasCard((cardx) => cardx.name == 'sha')) {
						return 5 - get.value(card);
					}
					return 3 - get.value(card);
				})
				.set('target', target)
				.set('chooseOnly', true)
				.forResult();
			event.result.targets = [target];
		},
		async content(event, trigger, player) {
			await player.discard(event.cards);
			await event.targets[0].addMark('sgsk_zhangu_1');
			await event.targets[0].addTempSkill('sgsk_zhangu_1');
		},
		subSkill: {
			1: {
				charlotte: true,
				trigger: {
					source: 'damageBegin1',
				},
				filter: (event, player) => (event.card?.name == 'sha' || event.card?.name == 'juedou') && player.isPhaseUsing(),
				forced: true,
				mark: true,
				marktext: '战',
				intro: {
					name: '战鼓',
					content: '本回合出牌阶段的杀或决斗造成的伤害+$',
				},
				async content(event, trigger, player) {
					let num = player.countMark('sgsk_zhangu_1');
					trigger.num += num;
				},
				ai: {
					damageBonus: true,
					skillTagFilter: (player, tag, arg) => (arg?.card?.name == 'sha' || arg?.card?.name == 'juedou') && player.isPhaseUsing(),
				},
			},
		},
	},
	sgsk_sanggu: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			global: 'phaseZhunbeiBegin',
		},
		async cost(event, trigger, player) {
			const target = trigger.player;
			event.result = await player
				.chooseToDiscard({ color: 'black' }, 'he')
				.set('prompt', `弃置一张黑色牌,令${get.translation(target)}本回合出牌阶段使用的【杀】或【决斗】伤害-1`)
				.set('ai', (card) => {
					const player = get.player(),
						target = get.event().target;

					if (get.attitude(player, target) > 0) {
						return 0;
					}
					if (target.hasCard((cardx) => cardx.name == 'juedou')) {
						return 7 - get.value(card);
					}
					if (target.hasCard((cardx) => cardx.name == 'sha')) {
						return 5 - get.value(card);
					}
					return 3 - get.value(card);
				})
				.set('target', target)
				.set('chooseOnly', true)
				.forResult();
			event.result.targets = [target];
		},
		async content(event, trigger, player) {
			await player.discard(event.cards);
			await event.targets[0].addMark('sgsk_sanggu_1');
			await event.targets[0].addTempSkill('sgsk_sanggu_1');
		},
		subSkill: {
			1: {
				charlotte: true,
				trigger: {
					source: 'damageBegin2',
				},
				filter: (event, player) => (event.card?.name == 'sha' || event.card?.name == 'juedou') && player.isPhaseUsing(),
				forced: true,
				mark: true,
				marktext: '丧',
				intro: {
					name: '丧鼓',
					content: '本回合出牌阶段的杀或决斗造成的伤害-$',
				},
				async content(event, trigger, player) {
					let num = player.countMark('sgsk_sanggu_1');
					trigger.num -= num;
				},
			},
		},
	},

	sgsk_zhanxing: {
		audio: 'ext:夜白神略/audio/character:2',
	},
	sgsk_wuxing: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCardToPlayered',
			target: 'useCardToTargeted',
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseToDiscard(2, 'he')
				.set('prompt', get.prompt2('sgsk_wuxing'))
				.set('filterCard', function (card) {
					if (!ui.selected.cards.length) {
						return true;
					}

					return Math.abs(ui.selected.cards[0].number - card.number) == 5 || ui.selected.cards[0].number + card.number == 5;
				})
				.set('complexCard', true)
				.set('chooseonly', true)
				.forResult();
		},
		async content(event, trigger, player) {
			await player.discard(event.cards);
			if (event.triggername == 'useCardToPlayered') {
				trigger.parent.directHit.addArray(game.players);
			} else {
				trigger.excluded.add(player);
				trigger.parent.targets.length = 0;
				trigger.parent.all_excluded = true;
			}
			trigger.parent.sgsk_wuxing = [];
			trigger.parent.sgsk_wuxing.add(player);
		},
		group: 'sgsk_wuxing_1',
		subSkill: {
			1: {
				trigger: {
					global: 'useCardAfter',
				},
				charlotte: true,
				forced: true,
				silent: true,
				popup: false,
				filter: (event, player) => event.sgsk_wuxing && event.sgsk_wuxing.includes(player),
				async content(event, trigger, player) {
					await player.draw(5);
					let cards = Array.from(ui.ordering.childNodes);
					while (cards.length) {
						cards.shift().discard();
					}
					let evt = _status.event.getParent('phase');
					if (evt) {
						game.resetSkills();
						let evtx = _status.event;
						while (evtx != evt) {
							evtx.finish();
							evtx.untrigger(true);
							evtx = evtx.parent;
						}
						evtx.finish();
						evtx.untrigger(true);
					}
				},
			},
		},
	},

	sgsk_dianhua: {
		audio: 'ext:夜白神略/audio/character:2',
		enable: 'phaseUse',
		usable: 1,
		filter(event, player) {
			return player.countCards('h') > 0;
		},
		filterCard: true,
		selectCard: -1,
		filterTarget(card, player, target) {
			return player != target;
		},
		discard: false,
		lose: false,
		delay: false,
		ai: {
			order: 1,
			result: {
				player: 0,
				target(player, target) {
					if (target.hasSkillTag('nogain')) {
						return 0;
					}
					return 1;
				},
			},
		},
		content() {
			'step 0';
			event.target1 = targets[0];
			player.give(cards, targets[0], false);
			('step 1');
			event.target1.chooseTarget('令一名角色回复1点体力或对一名角色造成1点伤害', true).set('ai', function (target) {
				let att = get.attitude(_status.event.player, target);

				if (att < 0) {
					return get.damageEffect(target, event.target1, _status.event.player);
				}
				return target.getDamagedHp();
			});
			('step 2');
			if (result.targets) {
				event.target2 = result.targets[0];
				let list = [];
				list.push('伤害');
				if (result.targets[0].isDamaged()) {
					list.push('回复');
				}
				if (list.length == 1) {
					event._result = { bool: true, control: '伤害' };
				} else {
					event.target1
						.chooseControl(list)
						.set('prompt', '令' + get.translation(result.targets[0]) + '回复还是受到伤害')
						.set('ai', function (target) {
							const player = _status.event.player;
							let target = result.targets[0];
							return get.attitude(player, target) > 0 ? '回复' : '伤害';
						});
				}
			}
			('step 3');
			if (event.target1 && event.target2 && result.control) {
				if (result.control == '伤害') {
					event.target2.damage(event.target1);
				} else {
					event.target2.recover(event.target1);
				}
			}
		},
	},
	sgsk_wuwo: {
		audio: 'ext:夜白神略/audio/character:2',
		mod: {
			targetEnabled(card, player, target, now) {
				if (target.countCards('h') == 0) {
					if (get.type2(card) == 'trick') {
						return false;
					}
				}
			},
		},
		group: 'sgsk_wuwo_1',
		ai: {
			noh: true,
			skillTagFilter(player, tag) {
				if (tag == 'noh') {
					if (player.countCards('h') != 1) {
						return false;
					}
				}
			},
		},
		trigger: { global: 'useCard1' },
		forced: true,
		firstDo: true,
		filter(event, player) {
			if (event.player == player) {
				return false;
			}
			if (get.type(event.card) != 'trick') {
				return false;
			}
			const info = lib.card[event.card.name];
			return info && info.selectTarget && info.selectTarget == -1 && !info.toself;
		},
		async content(event, trigger, player) { },
		subSkill: {
			1: {
				audio: 'sgsk_wuwo',
				trigger: { player: 'loseEnd' },
				forced: true,
				firstDo: true,
				sourceSkill: 'sgsk_wuwo',
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
				async content() { },
			},
		},
	},

	sgsk_yueshi: {
		preHidden: true,
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCardAfter',
		},

		filter(event, player) {
			return player.countCards('he') != 0;
		},
		async cost(event, trigger, player) {
			event.result = await player.chooseCard('he').forResult();
		},
		content() {
			player.recast(event.cards);
		},
	},

	sgsk_fuchou: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: { global: 'phaseAfter' },
		filter(event, player) {
			let target = event.player;
			return target.getHistory('sourceDamage', function (evt) {
				return evt.player == player;
			}).length;
		},
		check(event, player) {
			let target = event.player;
			if (get.effect(target, { name: 'sha' }, target, player) > 0) {
				return true;
			}
			return false;
		},
		content() {
			'step 0';
			player.draw();
			player.useCard({ name: 'sha', isCard: false }, trigger.player, 'sgsk_fuchou');
		},
	},

	bilibiliup_MANA: {
		marktext: '能',
		intro: {
			markcount(storage, player) {
				return player.storage.bilibiliup_MANA || 0;
			},
			content(storage, player) {
				const energy = player.storage.bilibiliup_MANA || 0;
				return '<li>当前能量:' + energy + '</li>';
			},
		},
	},
	bilibiliup_miaomiao: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: 'useCard',
		},
		filter(event, player) {
			let num = player.getAllHistory('useCard').length + player.getAllHistory('respond').length;
			const num2 = Math.max(1, player.hp);
			return num % num2 == 0;
		},
		content() {
			const num2 = Math.max(1, player.hp);
			player.draw(num2);
		},
		init(player) {
			player.markSkill('bilibiliup_miaomiao');
		},
		check(event, player) {
			return true;
		},
		forced: true,
		mark: true,
		marktext: '喵',
		intro: {
			markcount(storage, player) {
				let num = player.getAllHistory('useCard').length + player.getAllHistory('respond').length;
				return num;
			},
			content(storage, player) {
				let num = player.getAllHistory('useCard').length + player.getAllHistory('respond').length;
				const num2 = Math.max(1, player.hp);
				let str = '<li>距离下次摸牌:';
				str += (num % num2) + '/' + num2;
				return str;
			},
		},
	},

	bilibiliup_quanji: {
		audio: 'ext:夜白神略/audio/character:2',
		limited: true,
		trigger: {
			player: 'phaseUseBegin',
		},
		enable: 'phaseUse',
		filter(event, player, name) {
			if (name && name == 'phaseUseBegin') {
				return player.storage.bilibiliup_quanji_open;
			} else {
				return !player.storage.bilibiliup_quanji_open && player.countDiscardableCards(player, 'he');
			}
		},
		init(player, skill) {
			player.markSkill('bilibiliup_MANA');
		},
		async cost(event, trigger, player) {
			event.result = { bool: true };
		},
		subSkill: {
			zhuangdiqiu: {},
		},
		selectCard: 1,
		filterCard: true,
		position: 'he',
		async content(event, trigger, player) {
			if (event.triggername && event.triggername == 'phaseUseBegin') {
				const resultBefore = await player
					.chooseToDiscard('he', get.prompt('bilibiliup_quanji'))
					.set('ai', function (card) {
						if (player.countMark('bilibiliup_MANA') >= 3) {
							return get.unuseful(card) - player.countMark('bilibiliup_MANA');
						}
						return get.unuseful(card);
					})
					.forResult();
				if (resultBefore) {
					await huimieguxuli();
				} else {
					await huimiegubaozha();
					return;
				}
			} else {
				player.storage.bilibiliup_quanji_open = true;
				await huimieguxuli();
			}
			async function huimiegubaozha() {
				await player.awakenSkill('bilibiliup_quanji');
				let num = player.countMark('bilibiliup_MANA');
				await player.removeMark('bilibiliup_MANA', num);
				const targets = game.filterPlayer(function (current) {
					return current != player;
				});
				for (const i of targets) {
					await i.damage(num);
				}
			}
			async function huimieguxuli() {
				await player.addMark('bilibiliup_MANA', 1);
				if (player.countMark('bilibiliup_MANA') >= 3) {
					let result = await player.chooseBool('是否立即释放能量？').forResult();
					if (result.bool == true) {
						await huimiegubaozha();
						return;
					}
				}
			}
		},
		onremove(player) {
			player.storage.bilibiliup_quanji_open = false;
		},
	},
	bilibiliup_paiyi: {
		audio: 'ext:夜白神略/audio/character:2',
		trigger: {
			player: ['damageAfter', 'phaseDrawBegin'],
		},
		filter(event, player, name) {
			if (name == 'phaseDrawBegin') {
				return player.countMark('bilibiliup_MANA');
			}
			return player.countCards('he') > 0;
		},
		async cost(event, trigger, player) {
			if (event.triggername == 'phaseDrawBegin') {
				event.result = { bool: true };
			} else {
				event.result = await player
					.chooseToDiscard('he')
					.set('chooseonly', true)
					.set('ai', function (card) {
						if (player.countMark('bilibiliup_MANA') >= 3) {
							return false;
						}
						return get.unuseful(card);
					})
					.set('prompt', get.prompt('bilibiliup_paiyi'))
					.forResult();
			}
		},
		content() {
			if (event.triggername == 'phaseDrawBegin') {
				trigger.num += Math.min(3, player.countMark('bilibiliup_MANA'));
			} else {
				player.discard(event.cards);

				player.addMark('bilibiliup_MANA', 1);
			}
		},

		init(player) {
			player.markSkill('bilibiliup_MANA');
		},
	},
};
