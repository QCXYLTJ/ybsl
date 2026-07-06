import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

import { YBSL_rank } from './precontent/YB_01_rank.js';
import { YBSL_nature } from './precontent/YB_02_nature.js';
import { YBSL_trigger } from './precontent/YB_03_trigger.js';
import { YBSL_special } from './precontent/YB_04_special.js';
import { YBSL_pinyin } from './precontent/YB_05_pinyin.js';
import { YBSL_starmap } from './precontent/YB_06_starmap.js';
import { YBSL_qianhuan } from './precontent/YB_07_qianhuan.js';
import { YBSL_ybslf } from './precontent/YB_08_ybslf.js';
import { YBSL_update } from './precontent/YB_09_update.js';

import { YB_11_cardBrowser } from './precontent/YB_11_cardBrowser.js';

import { typeimage } from './function.js';

import { sgczk } from '../sgczk/mode.js';
import { cyyydsgs } from '../pile/cyyydsgs.js';

export async function precontent() {
	game.getFileList('extension/夜白神略/source/ext', (folders, files) => {
		const scriptPaths = files;
		Promise.all(scriptPaths.map((path) => import('../ext/' + path)))
			.then((modules) => { })
			.catch((error) => {
				alert('error ' + error + '导入失败 !');
				console.warn(error.message);
			});
	});

	game.getFileList('extension/夜白神略/source/ontology/card', (folders, files) => {
		const scriptPaths = files;
		Promise.all(
			scriptPaths.map((path) => {
				lib.init.js(lib.assetURL + 'extension/夜白神略/source/ontology/card', path.slice(0, -3));
			}),
		)
			.then((modules) => { })
			.catch((error) => {
				alert('error ' + error + '导入失败 !');
				console.warn(error.message);
			});
	});

	{
		lib.translate.yunchou_card_config = '运筹帷幄';
	}

	{
		const nor = lib.assetURL + 'extension/夜白神略/source/css';
		lib.init.css(nor, 'ybcss');
		{
			lib.init.css(nor, 'light');
		}
	}
	{
		YBSL_rank();
		YBSL_nature();
		YBSL_trigger();
		YBSL_special();
		YBSL_pinyin();
		YBSL_starmap();

		YBSL_ybslf();
		YBSL_update();

		YB_11_cardBrowser();
	}
	lib.arenaReady.push(function () {
		YBSL_rank();
		YBSL_nature();
		YBSL_trigger();
		YBSL_special();
		YBSL_pinyin();
		YBSL_starmap();

		YBSL_ybslf();
		YBSL_update();

		YB_11_cardBrowser();
		{
			/**
			 * 从字符串中提取第一个 HTML/XML 标签及其内容
			 * @param {string} str - 待处理的字符串,可能包含 HTML/XML 标签
			 * @returns {Object} 返回包含以下属性的对象:
			 *   - startTag: {string} 匹配到的开始标签(如 `<div class="test">`),未找到时返回空字符串
			 *   - endTag: {string} 匹配到的结束标签(如 `</div>`),未找到时返回空字符串
			 *   - content: {string} 去除开始标签和结束标签后的纯文本内容
			 * @example
			 *
			 * get.extractFirstTag('<div>Hello</div>');
			 * @example
			 *
			 * get.extractFirstTag('No tags');
			 */
			get.extractFirstTag = function (str) {
				const startTagRegex = /<[^>]+>/;
				const startTagMatch = str.match(startTagRegex);

				if (!startTagMatch) {
					return { startTag: '', endTag: '', content: str };
				}
				const startTag = startTagMatch[0];

				const endTagStart = str.indexOf(startTag) + startTag.length;

				const endTagRegex = /<\/[^>]+>/;
				const endTagMatch = str.slice(endTagStart).match(endTagRegex);

				if (!endTagMatch) {
					return { startTag: startTag, endTag: '', content: str.replace(startTag, '') };
				}
				const endTag = endTagMatch[0];

				const content = str.replace(startTag, '').replace(endTag, '');
				return { startTag, endTag, content };
			};
			get.copyright = function (name, macg) {
				if (lib.characterCopyright[name]) {
					let strx = lib.characterCopyright[name];
					if (macg) {
						strx = macg;
					}
					if (typeof strx == 'object' && !Array.isArray(strx)) {
						let str = '';
						const list = {
							pack: '武将包',
							num: '武将编号',
							skill: '技能设计',
							code: '代码编写',
							image: '插图',
							voice: '配音',
							icon: '◈',
						};
						let startTag, endTag, content;
						if (lib.characterTitle[name]) {
							({ startTag, endTag, content } = get.extractFirstTag(lib.characterTitle[name]));
						}
						if (startTag) {
							str += startTag;
						}

						const strlist = [];
						if (strx.pack) {
							strlist.push(strx.pack);
						}
						if (strx.num) {
							strlist.push(strx.num);
						}
						if (content) {
							strlist.push(content);
						}
						if (strlist.length) {
							str += strlist.join('-');
						}

						if (endTag) {
							str += endTag;
						}
						str += '<br>';
						if (!strx.icon) {
							strx.icon = '◈';
						}
						if (strx.skill) {
							str += strx.icon + list.skill + ':' + strx.skill;
							str += '<br>';
						}
						if (strx.code) {
							str += strx.icon + list.code + ':' + strx.code;
							str += '<br>';
						}
						if (strx.image) {
							str += strx.icon + list.image + ':' + strx.image;
							str += '<br>';
						}
						if (strx.voice) {
							str += strx.icon + list.voice + ':' + strx.voice;
							str += '<br>';
						}
						return str;
					} else if (typeof strx == 'string') {
						let str = '';
						strx = strx.replace(/\n/g, '<br>');
						str += strx;
						str += '<br>';
						return str;
					} else {
						const kkk = {
							pack: strx[0],
							num: strx[1],
							skill: strx[2],
							code: strx[3],
							image: strx[4],
							voice: strx[5],
							icon: strx[6],
						};
						return get.copyright(name, kkk);
					}
				}
			};
			const YB_characterIntro = get.characterIntro;
			get.characterIntro = function (name) {
				let str = '';
				if (lib.characterCopyright[name]) {
					const cpright = get.copyright(name);
					str += cpright;
					str += '<br>';
				}
				if (lib.characterCitetext[name]) {
					str += lib.characterCitetext[name];
					str += '<br>';
				}
				if (lib.characterUndertext[name]) {
					str += lib.characterUndertext[name];
					str += '<br>';
				}
				if (lib.characterLightext[name] && lib.characterLightext[name](name)) {
					str += lib.characterLightext[name](name)[lib.characterLightext[name](name).length - 1];
					str += '<br>';
				}
				if (lib.accessoryPacket[name] && lib.accessoryPacket[name].character) {
					const buttonsx = ui.create.div('.buttons');
					buttonsx.classList.add('smallzoom');
					const buttons = ui.create.buttons(lib.accessoryPacket[name].character, 'character', buttonsx, 'character');
					const arr = [];
					for (const i of buttons) {
						(_status.YB_582267 ??= {})[i.link] = i;
						let strx = i.outerHTML;
						strx = `${strx.slice(0, 5)}onclick='ui.click.charactercard("${i.link}", null, null, true, _status.YB_582267.${i.link}, "${i.link}")' ${strx.slice(5)}`;
						strx = `${strx.slice(0, 5)}ondblclick='ui.click.intro.call(_status.YB_582267.${i.link}, {
							clientX: this.getBoundingClientRect().left + 18,
							clientY: this.getBoundingClientRect().top + 12
						})' ${strx.slice(5)}`;
						strx = `${strx.slice(0, 5)}oncontextmenu='ui.click.intro.call(_status.YB_582267.${i.link}, {
							clientX: this.getBoundingClientRect().left + 18,
							clientY: this.getBoundingClientRect().top + 12
						})' ${strx.slice(5)}`;
						arr.push(strx);
					}
					arr.reduce((a, b) => a + b, '');
					str += arr;
					str += '<br>';
				}
				return (str += YB_characterIntro.apply(this, arguments));
			};
		}
		{
			const YB_nodeIntro = get.nodeintro;
			get.nodeintro = function (node, simple, evt) {
				let YB_intro = ui.create.dialog('hidden', 'notouchscroll');
				if (node.classList.contains('player') && !node.name) {
					return YB_intro;
				}
				let i, translation, intro, str;
				if (node._nointro) {
					return;
				}
				if (node.classList.contains('player') && node.linkplayer && (lib.characterTitle[node.name] || lib.characterCitetext[node.name] || (lib.characterLightext[node.name1] && lib.characterLightext[node.name1](node)) || lib.characterUndertext[node.name])) {
					if (node.linkplayer) {
						node = node.link;
					}
					let capt = get.translation(node.name);
					const characterInfo = get.character(node.name),
						sex = node.sex || characterInfo[0];
					if (sex && sex != 'unknown' && lib.config.show_sex) {
						capt += `&nbsp;&nbsp;${sex == 'none' ? '无' : get.translation(sex)}`;
					}
					const group = node.group;
					if (group && group != 'unknown' && lib.config.show_group) {
						capt += `&nbsp;&nbsp;${get.translation(group)}`;
					}
					YB_intro.add(capt);
					if (lib.characterTitle[node.name]) {
						YB_intro.addText(get.colorspan(lib.characterTitle[node.name]));
					}
					if (lib.characterAppend[node.name]) {
						YB_intro.addText(get.colorspan(lib.characterAppend[node.name]));
					}
					if (lib.characterCitetext[node.name]) {
						YB_intro.addText(get.colorspan(lib.characterCitetext[node.name]));
					}
					if (lib.characterLightext[node.name1] && lib.characterLightext[node.name1](node)) {
						YB_intro.addText(get.colorspan(lib.characterLightext[node.name1](node)[lib.characterLightext[node.name1](node).length - 1]));
					}

					if (lib.config.show_sortPack) {
						for (const packname in lib.characterPack) {
							if (node.name in lib.characterPack[packname]) {
								let pack = lib.translate[packname + '_character_config'],
									sort;
								if (lib.characterSort[packname]) {
									const sorted = lib.characterSort[packname];
									for (const sortname in sorted) {
										if (sorted[sortname].includes(node.name)) {
											sort = `<span style = "font-size:small">${lib.translate[sortname]}</span>`;
											break;
										}
									}
								}
								const sortPack = document.createElement('div');
								sortPack.innerHTML = `${pack}${sort ? `<br>[${sort}]` : ''}`;
								sortPack.appendChild(document.createElement('hr'));
								sortPack.insertBefore(document.createElement('hr'), sortPack.firstChild);
								YB_intro.add(sortPack);
								break;
							}
						}
					}
					if (get.characterInitFilter(node.name)) {
						const initFilters = get.characterInitFilter(node.name).filter((tag) => {
							if (!lib.characterInitFilter[node.name]) {
								return true;
							}
							return lib.characterInitFilter[node.name](tag) !== false;
						});
						if (initFilters.length) {
							const str = initFilters.reduce((strx, stry) => strx + lib.InitFilter[stry] + '<br>', '').slice(0, -4);
							YB_intro.addText(str);
						}
					}
					if (!node.noclick) {
						const allShown = node.isUnderControl() || (!game.observe && game.me && game.me.hasSkillTag('viewHandcard', null, node, true));
						const shownHs = node.getShownCards();
						if (shownHs.length) {
							YB_intro.add('<div class="text center">明置的手牌</div>');
							YB_intro.addSmall(shownHs);
							if (allShown) {
								const hs = node.getCards('h');
								hs.removeArray(shownHs);
								if (hs.length) {
									YB_intro.add('<div class="text center">其他手牌</div>');
									YB_intro.addSmall(hs);
								}
							}
						} else if (allShown) {
							const hs = node.getCards('h');
							if (hs.length) {
								YB_intro.add('<div class="text center">手牌</div>');
								YB_intro.addSmall(hs);
							}
						}
					}
					const skills = node.getSkills(null, false, false).slice(0);
					const skills2 = game.filterSkills(skills, node);
					if (node == game.me && node.hiddenSkills.length) {
						skills.addArray(node.hiddenSkills);
					}
					for (let i in node.disabledSkills) {
						if (node.disabledSkills[i].length == 1 && node.disabledSkills[i][0] == i + '_awake' && !node.hiddenSkills.includes(i)) {
							skills.add(i);
						}
					}
					for (let i = 0; i < skills.length; i++) {
						if (lib.skill[skills[i]] && (lib.skill[skills[i]].nopop || lib.skill[skills[i]].equipSkill)) {
							continue;
						}
						if (lib.translate[skills[i] + '_info']) {
							if (lib.translate[skills[i] + '_ab']) {
								translation = lib.translate[skills[i] + '_ab'];
							} else {
								translation = get.translation(skills[i]);
								if (!lib.skill[skills[i]].nobracket) {
									translation = `【${translation.slice(0, 2)}】`;
								}
							}
							if (node.forbiddenSkills[skills[i]]) {
								let forbidstr = '<div style="opacity:0.5"><div class="skill">' + translation + '</div><div>';
								if (node.forbiddenSkills[skills[i]].length) {
									forbidstr += '(与' + get.translation(node.forbiddenSkills[skills[i]]) + '冲突)<br>';
								} else {
									forbidstr += '(双将禁用)<br>';
								}
								forbidstr += get.skillInfoTranslation(skills[i], node) + '</div></div>';
								YB_intro.add(forbidstr);
							} else if (!skills2.includes(skills[i])) {
								if (lib.skill[skills[i]].preHidden && get.mode() == 'guozhan') {
									YB_intro.add('<div><div class="skill" style="opacity:0.5">' + translation + '</div><div><span style="opacity:0.5">' + get.skillInfoTranslation(skills[i], node) + '</span><br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">预亮技能</div></div></div>');
									const underlinenode = YB_intro.content.lastChild.querySelector('.underlinenode');
									if (_status.prehidden_skills.includes(skills[i])) {
										underlinenode.classList.remove('on');
									}
									underlinenode.link = skills[i];
									underlinenode.listen(ui.click.hiddenskill);
								} else {
									YB_intro.add('<div style="opacity:0.5"><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], node) + '</div></div>');
								}
							} else if (lib.skill[skills[i]].temp || !node.skills.includes(skills[i]) || lib.skill[skills[i]].thundertext) {
								if (lib.skill[skills[i]].frequent || lib.skill[skills[i]].subfrequent) {
									YB_intro.add('<div><div class="skill thundertext thunderauto">' + translation + '</div><div class="thundertext thunderauto">' + get.skillInfoTranslation(skills[i], node) + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">自动发动</div></div></div>');
									const underlinenode = YB_intro.content.lastChild.querySelector('.underlinenode');
									if (lib.skill[skills[i]].frequent) {
										if (lib.config.autoskilllist.includes(skills[i])) {
											underlinenode.classList.remove('on');
										}
									}
									if (lib.skill[skills[i]].subfrequent) {
										for (let j = 0; j < lib.skill[skills[i]].subfrequent.length; j++) {
											if (lib.config.autoskilllist.includes(skills[i] + '_' + lib.skill[skills[i]].subfrequent[j])) {
												underlinenode.classList.remove('on');
											}
										}
									}
									if (lib.config.autoskilllist.includes(skills[i])) {
										underlinenode.classList.remove('on');
									}
									underlinenode.link = skills[i];
									underlinenode.listen(ui.click.autoskill2);
								} else {
									YB_intro.add('<div><div class="skill thundertext thunderauto">' + translation + '</div><div class="thundertext thunderauto">' + get.skillInfoTranslation(skills[i], node) + '</div></div>');
								}
							} else if (lib.skill[skills[i]].frequent || lib.skill[skills[i]].subfrequent) {
								YB_intro.add('<div><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], node) + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">自动发动</div></div></div>');
								const underlinenode = YB_intro.content.lastChild.querySelector('.underlinenode');
								if (lib.skill[skills[i]].frequent) {
									if (lib.config.autoskilllist.includes(skills[i])) {
										underlinenode.classList.remove('on');
									}
								}
								if (lib.skill[skills[i]].subfrequent) {
									for (let j = 0; j < lib.skill[skills[i]].subfrequent.length; j++) {
										if (lib.config.autoskilllist.includes(skills[i] + '_' + lib.skill[skills[i]].subfrequent[j])) {
											underlinenode.classList.remove('on');
										}
									}
								}
								if (lib.config.autoskilllist.includes(skills[i])) {
									underlinenode.classList.remove('on');
								}
								underlinenode.link = skills[i];
								underlinenode.listen(ui.click.autoskill2);
							} else if (lib.skill[skills[i]].clickable && node.isIn() && node.isUnderControl(true)) {
								const intronode = YB_intro.add('<div><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], node) + '<br><div class="menubutton skillbutton" style="position:relative;margin-top:5px">点击发动</div></div></div>').querySelector('.skillbutton');
								if (!_status.gameStarted || (lib.skill[skills[i]].clickableFilter && !lib.skill[skills[i]].clickableFilter(node))) {
									intronode.classList.add('disabled');
									intronode.style.opacity = 0.5;
								} else {
									intronode.link = node;
									intronode.func = lib.skill[skills[i]].clickable;
									intronode.classList.add('pointerdiv');
									intronode.listen(ui.click.skillbutton);
								}
							} else {
								YB_intro.add('<div><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], node) + '</div></div>');
							}
							if (lib.translate[skills[i] + '_append']) {
								YB_intro._place_text = YB_intro.add('<div class="text">' + lib.translate[skills[i] + '_append'] + '</div>');
							}
						}
					}

					if (lib.characterUndertext[node.name]) {
						YB_intro.addText(get.colorspan(lib.characterUndertext[node.name]));
					}
					if (lib.config.right_range && _status.gameStarted) {
						YB_intro.add(ui.create.div('.placeholder'));
						let table, tr, td;
						table = document.createElement('table');
						tr = document.createElement('tr');
						table.appendChild(tr);
						td = document.createElement('td');
						td.innerHTML = '距离';
						tr.appendChild(td);
						td = document.createElement('td');
						td.innerHTML = '手牌';
						tr.appendChild(td);
						td = document.createElement('td');
						td.innerHTML = '行动';
						tr.appendChild(td);
						td = document.createElement('td');
						td.innerHTML = '伤害';
						tr.appendChild(td);
						tr = document.createElement('tr');
						table.appendChild(tr);
						td = document.createElement('td');
						if (node == game.me || !game.me || !game.me.isIn()) {
							td.innerHTML = '-';
						} else {
							const dist1 = get.numStr(Math.max(1, game.me.distanceTo(node)));
							const dist2 = get.numStr(Math.max(1, node.distanceTo(game.me)));
							if (dist1 == dist2) {
								td.innerHTML = dist1;
							} else {
								td.innerHTML = dist1 + '/' + dist2;
							}
						}
						tr.appendChild(td);
						td = document.createElement('td');
						const handcardLimit = node.getHandcardLimit();
						td.innerHTML = `${node.countCards('h')}/${handcardLimit >= 999 ? '∞' : handcardLimit}`;
						tr.appendChild(td);
						td = document.createElement('td');
						td.innerHTML = node.phaseNumber;
						tr.appendChild(td);
						td = document.createElement('td');
						let num = 0;
						for (let j = 0; j < node.stat.length; j++) {
							if (typeof node.stat[j].damage == 'number') {
								num += node.stat[j].damage;
							}
						}
						td.innerHTML = num;
						tr.appendChild(td);
						table.style.width = 'calc(100% - 20px)';
						table.style.marginLeft = '10px';
						YB_intro.content.appendChild(table);
						if (!lib.config.show_favourite) {
							table.style.paddingBottom = '5px';
						}
					}
					if (!simple || get.is.phoneLayout()) {
						const es = node.getCards('e');
						for (let i = 0; i < es.length; i++) {
							const special = [es[i]].concat(es[i].cards || []).find((j) => j.name == es[i].name && lib.card[j.name]?.cardPrompt);
							let str = special ? lib.card[special.name].cardPrompt(special) : lib.translate[es[i].name + '_info'];
							YB_intro.add('<div><div class="skill">' + es[i].outerHTML + '</div><div>' + str + '</div></div>');
							YB_intro.content.lastChild.querySelector('.skill>.card').style.transform = '';
							if (lib.translate[es[i].name + '_append']) {
								YB_intro.add('<div class="text">' + lib.translate[es[i].name + '_append'] + '</div>');
							}
						}
						const js = node.getCards('j');
						for (let i = 0; i < js.length; i++) {
							if (js[i].viewAs && js[i].viewAs != js[i].name) {
								let html = js[i].outerHTML;
								let cardInfo = lib.card[js[i].viewAs],
									showCardIntro = true;
								if (cardInfo.blankCard) {
									const cardOwner = get.owner(js[i]);
									if (cardOwner && !cardOwner.isUnderControl(true)) {
										showCardIntro = false;
									}
								}
								if (!showCardIntro) {
									html = ui.create.button(js[i], 'blank').outerHTML;
								}
								YB_intro.add('<div><div class="skill">' + html + '</div><div>' + lib.translate[js[i].viewAs] + ':' + lib.translate[js[i].viewAs + '_info'] + '</div></div>');
							} else {
								YB_intro.add('<div><div class="skill">' + js[i].outerHTML + '</div><div>' + lib.translate[js[i].name + '_info'] + '</div></div>');
							}
							YB_intro.content.lastChild.querySelector('.skill>.card').style.transform = '';
						}
						if (get.is.phoneLayout()) {
							const markCoutainer = ui.create.div('.mark-container.marks');
							for (let i in node.marks) {
								const nodemark = node.marks[i].cloneNode(true);
								nodemark.classList.add('pointerdiv');
								nodemark.link = node.marks[i];
								nodemark.style.transform = '';
								markCoutainer.appendChild(nodemark);
								nodemark.listen(function () {
									YB_intro.noresume = true;
									const rect = this.link.getBoundingClientRect();
									ui.click.intro.call(this.link, {
										clientX: rect.left + rect.width,
										clientY: rect.top + rect.height / 2,
									});
									if (lib.config.touchscreen) {
										YB_intro._close();
									}
								});
							}
							if (markCoutainer.childElementCount) {
								YB_intro.addText('标记');
								YB_intro.add(markCoutainer);
							}
						}
					}
					if (!game.observe && _status.gameStarted && game.me && node != game.me) {
						ui.throwEmotion = [];
						YB_intro.addText('发送交互表情');
						const click = function () {
							if (_status.dragged) {
								return;
							}
							if (_status.justdragged) {
								return;
							}
							if (_status.throwEmotionWait) {
								return;
							}
							const emotion = this.link;
							if (game.online) {
								game.send('throwEmotion', node, emotion);
							} else {
								game.me.throwEmotion(node, emotion);
							}
							YB_intro._close();
							_status.throwEmotionWait = true;
							setTimeout(
								function () {
									_status.throwEmotionWait = false;
									if (ui.throwEmotion) {
										for (const i of ui.throwEmotion) {
											i.classList.remove('exclude');
										}
									}
								},
								emotion == 'flower' || emotion == 'egg' ? 500 : 5000,
							);
						};
						let td;
						let table = document.createElement('div');
						table.classList.add('add-setting');
						table.style.margin = '0';
						table.style.width = '100%';
						table.style.position = 'relative';
						let listi = ['flower', 'egg'];
						for (let i = 0; i < listi.length; i++) {
							td = ui.create.div('.menubutton.reduce_radius.pointerdiv.tdnode');
							ui.throwEmotion.add(td);
							if (_status.throwEmotionWait) {
								td.classList.add('exclude');
							}
							td.link = listi[i];
							table.appendChild(td);
							td.innerHTML = '<span>' + get.translation(listi[i]) + '</span>';
							td.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', click);
						}
						YB_intro.content.appendChild(table);
						table = document.createElement('div');
						table.classList.add('add-setting');
						table.style.margin = '0';
						table.style.width = '100%';
						table.style.position = 'relative';
						let listi1 = ['wine', 'shoe'];
						if (game.me.storage.zhuSkill_shanli) {
							listi1 = ['yuxisx', 'jiasuo'];
						}
						for (let i = 0; i < listi1.length; i++) {
							td = ui.create.div('.menubutton.reduce_radius.pointerdiv.tdnode');
							ui.throwEmotion.add(td);
							if (_status.throwEmotionWait) {
								td.classList.add('exclude');
							}
							td.link = listi1[i];
							table.appendChild(td);
							td.innerHTML = '<span>' + get.translation(listi1[i]) + '</span>';
							td.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', click);
						}
						YB_intro.content.appendChild(table);
					}
					const modepack = lib.characterPack['mode_' + get.mode()];
					if (lib.config.show_favourite && lib.character[node.name] && game.players.includes(node) && (!modepack || !modepack[node.name]) && (!simple || get.is.phoneLayout())) {
						const addFavourite = ui.create.div('.text.center.pointerdiv');
						addFavourite.link = node.name;
						if (lib.config.favouriteCharacter.includes(node.name)) {
							addFavourite.innerHTML = '移除收藏';
						} else {
							addFavourite.innerHTML = '添加收藏';
						}
						addFavourite.listen(ui.click.favouriteCharacter);
						YB_intro.add(addFavourite);
					}
					if (!simple || get.is.phoneLayout()) {
						const viewInfo = ui.create.div('.text.center.pointerdiv');
						viewInfo.link = node;
						viewInfo.innerHTML = '查看资料';
						viewInfo.listen(function () {
							const player2 = this.link;
							const audioName = player2.skin.name || player2.name1 || player2.name;
							ui.click.charactercard(player2.name1 || player2.name, null, null, true, player2.node.avatar, audioName);
						});
						YB_intro.add(viewInfo);
					}
					YB_intro.add(ui.create.div('.placeholder.slim'));
				} else if (node.classList.contains('character') && (lib.characterTitle[node.link] || lib.characterCitetext[node.link] || (lib.characterLightext[node.link] && lib.characterLightext[node.link](node.link)) || lib.characterUndertext[node.link])) {
					const character = node.link,
						characterInfo = get.character(node.link);
					let capt = get.translation(character);
					if (characterInfo) {
						const infoSex = characterInfo[0];
						if (infoSex && lib.config.show_sex) {
							capt += `&nbsp;&nbsp;${infoSex == 'none' ? '无' : lib.translate[infoSex]}`;
						}
						const infoGroup = characterInfo[1];
						if (infoGroup && lib.config.show_group) {
							const group = get.is.double(character, true);
							if (group) {
								capt += `&nbsp;&nbsp;${group.map((value) => get.translation(value)).join('/')}`;
							} else {
								capt += `&nbsp;&nbsp;${lib.translate[infoGroup]}`;
							}
						}
					}
					YB_intro.add(capt);
					if (lib.characterTitle[node.link]) {
						YB_intro.addText(get.colorspan(lib.characterTitle[node.link]));
					}
					if (lib.characterAppend[node.link]) {
						YB_intro.addText(get.colorspan(lib.characterAppend[node.link]));
					}
					if (lib.characterCitetext[node.link]) {
						YB_intro.addText(get.colorspan(lib.characterCitetext[node.link]));
					}
					if (lib.characterLightext[node.link] && lib.characterLightext[node.link](node.link)) {
						YB_intro.addText(get.colorspan(lib.characterLightext[node.link](node.link)[lib.characterLightext[node.link](node.link).length - 1]));
					}
					if (lib.config.show_sortPack) {
						for (const packname in lib.characterPack) {
							if (node.link in lib.characterPack[packname]) {
								let pack = lib.translate[packname + '_character_config'],
									sort;
								if (lib.characterSort[packname]) {
									const sorted = lib.characterSort[packname];
									for (const sortname in sorted) {
										if (sorted[sortname].includes(node.link)) {
											sort = `<span style = "font-size:small">[${lib.translate[sortname]}]</span>`;
											break;
										}
									}
								}
								const sortPack = document.createElement('div');
								sortPack.innerHTML = `${pack}${sort ? `<br>${sort}` : ''}`;
								sortPack.appendChild(document.createElement('hr'));
								sortPack.insertBefore(document.createElement('hr'), sortPack.firstChild);
								YB_intro.add(sortPack);
								break;
							}
						}
					}
					if (get.characterInitFilter(node.link)) {
						const initFilters = get.characterInitFilter(node.link).filter((tag) => {
							if (!lib.characterInitFilter[node.link]) {
								return true;
							}
							return lib.characterInitFilter[node.link](tag) !== false;
						});
						if (initFilters.length) {
							const str = initFilters.reduce((strx, stry) => strx + lib.InitFilter[stry] + '<br>', '').slice(0, -4);
							YB_intro.addText(str);
						}
					}
					if (node._banning) {
						const clickBanned = function () {
							const banned = lib.config[this.bannedname] || [];
							if (banned.includes(character)) {
								banned.remove(character);
							} else {
								banned.push(character);
							}
							game.saveConfig(this.bannedname, banned);
							this.classList.toggle('on');
							if (node.updateBanned) {
								node.updateBanned();
							}
						};
						const modeorder = lib.config.modeorder || [];
						for (let i in lib.mode) {
							modeorder.add(i);
						}
						const list = [];
						YB_intro.contentContainer.listen(function (e) {
							ui.click.touchpop();
							e.stopPropagation();
						});
						for (let i = 0; i < modeorder.length; i++) {
							if (node._banning == 'online') {
								if (!lib.mode[modeorder[i]].connect) {
									continue;
								}
								if (!lib.config['connect_' + modeorder[i] + '_banned']) {
									lib.config['connect_' + modeorder[i] + '_banned'] = [];
								}
							} else if (modeorder[i] == 'connect' || modeorder[i] == 'brawl') {
								continue;
							}
							if (lib.config.all.mode.includes(modeorder[i])) {
								list.push(modeorder[i]);
							}
						}
						const page = ui.create.div('.menu-buttons.configpopped', YB_intro.content);
						let banall = false;
						for (let i = 0; i < list.length; i++) {
							const cfg = ui.create.div('.config', lib.translate[list[i]] + '模式', page);
							cfg.classList.add('toggle');
							if (node._banning == 'offline') {
								cfg.bannedname = list[i] + '_banned';
							} else {
								cfg.bannedname = 'connect_' + list[i] + '_banned';
							}
							cfg.listen(clickBanned);
							ui.create.div(ui.create.div(cfg));
							const banned = lib.config[cfg.bannedname] || [];
							if (!banned.includes(character)) {
								cfg.classList.add('on');
								banall = true;
							}
						}
						if (node._banning == 'offline') {
							const cfg = ui.create.div('.config', '随机选将可用', page);
							cfg.classList.add('toggle');
							cfg.listen(function () {
								this.classList.toggle('on');
								if (this.classList.contains('on')) {
									lib.config.forbidai_user.remove(character);
								} else {
									lib.config.forbidai_user.add(character);
								}
								game.saveConfig('forbidai_user', lib.config.forbidai_user);
							});
							ui.create.div(ui.create.div(cfg));
							if (!lib.config.forbidai_user.includes(character)) {
								cfg.classList.add('on');
							}
						}
						ui.create.div('.menubutton.pointerdiv', banall ? '全部禁用' : '全部启用', YB_intro.content, function () {
							if (this.innerHTML == '全部禁用') {
								for (let i = 0; i < page.childElementCount; i++) {
									if (page.childNodes[i].bannedname && page.childNodes[i].classList.contains('on')) {
										clickBanned.call(page.childNodes[i]);
									}
								}
								this.innerHTML = '全部启用';
							} else {
								for (let i = 0; i < page.childElementCount; i++) {
									if (page.childNodes[i].bannedname && !page.childNodes[i].classList.contains('on')) {
										clickBanned.call(page.childNodes[i]);
									}
								}
								this.innerHTML = '全部禁用';
							}
						}).style.marginTop = '-10px';
						ui.create.div('.placeholder.slim', YB_intro.content);
					} else {
						const skills = get.character(character, 3);
						for (let i = 0; i < skills.length; i++) {
							if (lib.translate[skills[i] + '_info']) {
								if (lib.translate[skills[i] + '_ab']) {
									translation = lib.translate[skills[i] + '_ab'];
								} else {
									translation = get.translation(skills[i]);
									if (!lib.skill[skills[i]].nobracket) {
										translation = `【${translation.slice(0, 2)}】`;
									}
								}
								YB_intro.add('<div><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], null, false) + '</div></div>');
								if (lib.translate[skills[i] + '_append']) {
									YB_intro._place_text = YB_intro.add('<div class="text">' + lib.translate[skills[i] + '_append'] + '</div>');
								}
							}
						}
						const modepack = lib.characterPack['mode_' + get.mode()];
						if (lib.config.show_favourite && lib.character[node.link] && (!modepack || !modepack[node.link]) && (!simple || get.is.phoneLayout())) {
							const addFavourite = ui.create.div('.text.center.pointerdiv');
							addFavourite.link = node.link;
							addFavourite.style.marginBottom = '15px';
							if (lib.config.favouriteCharacter.includes(node.link)) {
								addFavourite.innerHTML = '移除收藏';
							} else {
								addFavourite.innerHTML = '添加收藏';
							}
							addFavourite.listen(ui.click.favouriteCharacter);
							YB_intro.add(addFavourite);
						} else {
							YB_intro.add(ui.create.div('.placeholder.slim'));
						}

						if (!simple || get.is.phoneLayout()) {
							const viewInfo = ui.create.div('.text.center.pointerdiv');
							viewInfo.link = node.link;
							viewInfo.innerHTML = '查看资料';
							viewInfo.style.marginBottom = '15px';
							viewInfo.listen(function () {
								return ui.click.charactercard(this.link, node);
							});
							YB_intro.add(viewInfo);
						}
					}
					if (lib.characterUndertext[node.link]) {
						YB_intro.addText(get.colorspan(lib.characterUndertext[node.link]));
					}
				} else {
					YB_intro = YB_nodeIntro.apply(this, arguments);
				}

				return YB_intro;
			};
		}
		{
			get.YB_prompt2 = function (skill, target, player) {
				let str = get.prompt.apply(this, arguments);
				if (!lib.translate[skill + '_info'] && !lib.translate[skill + '_info']) {
					return str;
				}
				if (lib.dynamicTranslate[skill] && lib.dynamicTranslate[skill] != undefined) {
					return '###' + str + '###<br>' + lib.dynamicTranslate[skill](player);
				}
				return '###' + str + '###<br>' + lib.translate[skill + '_info'];
			};
		}
		{
			lib.type = {
				delay: 'trick',
				law: 'trick',
				flower: 'basic',
			};
			get.type = function (obj, method, player) {
				if (typeof obj == 'string') {
					obj = { name: obj };
				}
				if (typeof obj != 'object') {
					return;
				}
				const name2 = obj.name;
				if (!lib.card[name2]) {
					if (!name2?.startsWith('sha_')) {
						return;
					}
					if (
						name2
							.slice(4)
							.split('_')
							.every((n) => lib.nature.has(n))
					) {
						return lib.card.sha.type;
					}
				}
				if (method == 'trick' && lib.card[name2].type && lib.type[lib.card[name2].type]) {
					return lib.type[lib.card[name2].type];
				}
				return lib.card[name2].type;
			};
		}
		{
			if (!lib.qhlypkg) {
				lib.qhlypkg = [];
			}

			const packagesx = {
				ybslj: 'ybsl001',
				ybart: 'ybsl001',
				ybxh: 'ybsl003',
				ybnew1: 'ybsl004',
				ybmjz: 'ybsl008',
				ybdd: 'ybsl009',
				ybMagic: 'ybsl010',
				yhky: 'ybsl011',
				sgstrxs: 'ybsl012',
				ybwhjx: 'ybsl013',
				cyyydsgs: 'cyyydsgs',
				jhjx: 'jhjx',
			};

			for (let i in packagesx) {
				lib.qhlypkg.push({
					isExt: true,
					filterCharacter(name) {
						if (!lib.characterPack[i]) {
							return;
						}
						if (lib.characterPack[i][name]) {
							return true;
						}
					},
					prefix: `extension/夜白神略/image/${packagesx[i]}/`,
					skin: {
						standard: 'extension/夜白神略/skin/standard/',
					},
					audioOrigin: 'extension/夜白神略/audio/character/',
					audio: 'extension/夜白神略/skin/audio/',
				});
			}
		}
	});

	lib.arenaReady.push(function () {
		if (lib.config.extension_夜白神略_夜白神略的蓄力点改蓝条 == true) {
			/**
			 * 获得蓄力点
			 * @param { number } [num = 1] 获得蓄力点数
			 * @param { boolean } [log] false: 不进行广播
			 */
			lib.element.player.addCharge = function (num, log) {
				if (typeof num != 'number' || !num) {
					num = 1;
				}
				const maxCharge = this.getMaxCharge();
				if (maxCharge == Infinity) {
					this.addMark('charge', num, log);
				} else {
					num = Math.min(num, maxCharge - this.countMark('charge'));
					if (num > 0) {
						this.addMark('charge', num, log);
					}
				}
				this.YB_updateCharge();
			};
			/**
			 * 移去蓄力点
			 * @param { number } [num = 1] 移去蓄力点数
			 * @param { boolean } [log] false: 不进行广播
			 */
			lib.element.player.removeCharge = function (num, log) {
				if (typeof num != 'number' || !num) {
					num = 1;
				}
				num = Math.min(num, this.countMark('charge'));
				if (num > 0) {
					this.removeMark('charge', num, log);
				}
				this.YB_updateCharge();
			};
			/**
			 * 返回玩家的蓄力点数
			 * @param { boolean } [max] true: 返回当前蓄力点与上限之差
			 * @returns { number }
			 */
			lib.element.player.countCharge = function (max) {
				if (max) {
					if (this.getMaxCharge() == Infinity) {
						return Infinity;
					}
					return this.getMaxCharge() - this.countMark('charge');
				}
				return this.countMark('charge');
			};
			/**
			 * 获取蓄力点上限
			 */
			lib.element.player.getMaxCharge = function () {
				const skills = game.expandSkills(this.getSkills().concat(lib.skill.global));
				let max = 0;
				for (const skill of skills) {
					const info = get.info(skill);
					if (!info || !info.chargeSkill || typeof info.chargeSkill != 'number') {
						continue;
					}
					if (info.chargeSkill == Infinity) {
						return Infinity;
					}
					max += info.chargeSkill;
				}
				max = game.checkMod(this, max, 'maxCharge', this);
				return max;
			};

			/**
			 * 更新蓄力条
			 */
			lib.element.player.YB_updateCharge = function () {
				const player = this;
				game.broadcastAll(function (player) {
					if (!player.charge) {
						player.charge = ui.create.div('.mana_nengliangtiao', player);
						ui.create.div('.mana_jindutiao', player.charge);
					}
					const mana_jindutiao = player.charge.firstChild;
					const v = player.countMark('charge') / player.getMaxCharge();
					if (player.dataset.position == 0) {
						mana_jindutiao.style.width = `${100 * v}%`;
						mana_jindutiao.style.height = `100%`;
						mana_jindutiao.innerHTML = '<span style="font-size:19px;color: black;text-shadow:0px 0px 5px #ff0;">' + player.countMark('charge') + '/' + player.getMaxCharge() + '</span>';
					} else {
						mana_jindutiao.style.width = `100%`;
						mana_jindutiao.style.height = `${100 * v}%`;
						mana_jindutiao.innerHTML = '<span style="font-size:19px;color: black;text-shadow:0px 0px 5px #ff0;">' + player.getMaxCharge() + '<br>/<br>' + player.countMark('charge') + '</span>';
					}
				}, player);
			};
			/**修改蓄力(没用上) */
			lib.skill.charge = {
				markimage: 'image/card/charge.png',
				intro: {
					content(storage, player) {
						let max = player.getMaxCharge();
						if (max == Infinity) {
							max = '∞';
						}
						return `当前蓄力点数:${storage}/${max}`;
					},
				},
			};
		}
	});
	lib.arenaReady.push(function () {
		if (lib.config.extension_云中守望_enable == true) {
			if (lib.character['dzsl_014liutianyu']) {
				lib.character['dzsl_014liutianyu'].isUnseen = true;
			}
			if (lib.character.ybmjz_shen_caopi) {
				lib.character.ybmjz_shen_caopi.isUnseen = true;
			}
		}
	});
	get.typeimage = typeimage;

	cyyydsgs();
}
