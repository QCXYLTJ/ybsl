import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export { YB_characterIntro, YBSL_characterIntro, mergeObjects, characterIntro, nodeintro, typeimage };
// export { typeimage }
/**
 * 合并多个对象的键值对.
 * - 如果目标对象中已经存在某个键,则将源对象的值拼接到目标对象的值上.
 * - 如果目标对象中不存在某个键,则将源对象的键值对搬运到目标对象中.
 * - 跳过没有键值对的对象.
 *
 * @param {...Object} objects - 需要合并的多个对象(支持任意数量).
 * @returns {Object} - 返回合并后的结果对象.
 *
 * @example
 * const str1 = { a: '曹操', b: '吕布' };
 * const str2 = { b: '字奉先', c: '字玄德' };
 * const str3 = { a: '字孟德', d: '关羽' };
 * const str4 = { c: '刘备', d: '字云长' };
 * const mergedResult = mergeObjects(str1, str2, str3, str4);
 * console.log(mergedResult);
 * // 输出: { a: '曹操 字孟德', b: '吕布 字奉先', c: '字玄德 刘备', d: '关羽 字云长' }
 */
const mergeObjects = function (...objects) {
	// 目标对象,用于存储合并后的结果
	const result = {};
	// 遍历所有对象
	objects.forEach((currentObj, index) => {
		// 检查当前对象是否有键值对
		if (currentObj && Object.keys(currentObj).length) {
			// 遍历当前对象的键值对
			for (const subKey in currentObj) {
				if (result.hasOwnProperty(subKey)) {
					// 如果目标对象中已经存在该键,则拼接值
					result[subKey] = result[subKey] + '<br>' + currentObj[subKey];
				} else {
					// 如果目标对象中不存在该键,则搬运键值对
					result[subKey] = currentObj[subKey];
				}
			}
		}
		// else {
		// 	console.log(`第 ${index + 1} 个对象没有键值对,跳过处理`);
		// }
	});
	return result;
};
const YB_characterIntro = function (str1, str2, str3, str4) {
	// 目标对象,用于存储合并后的结果
	const result = {};
	// 将所有对象放入一个数组中
	const objects = [str1, str2, str3, str4];
	// 遍历所有对象
	objects.forEach((currentObj, index) => {
		// 检查当前对象是否有键值对
		if (Object.keys(currentObj).length) {
			// 遍历当前对象的键值对
			for (const subKey in currentObj) {
				if (result.hasOwnProperty(subKey)) {
					// 如果目标对象中已经存在该键,则拼接值
					result[subKey] = result[subKey] + '<br>' + currentObj[subKey];
				} else {
					// 如果目标对象中不存在该键,则搬运键值对
					result[subKey] = currentObj[subKey];
				}
			}
		}
		// else {
		// 	console.log(`str${index + 1} 没有键值对,跳过处理`);
		// }
	});
	// 处理 str4 中没有对应键的情况
	for (const key in result) {
		if (!str4.hasOwnProperty(key)) {
			// 调用 YBSL_characterIntro 函数生成对应的值
			const generatedValue = YBSL_characterIntro(key);
			// 将生成的值拼接到结果中
			if (result.hasOwnProperty(key)) {
				result[key] = result[key] + '<br>' + generatedValue;
			} else {
				result[key] = generatedValue;
			}
		}
	}
	return result;
};
const YBSL_characterIntro = function (name) {
	// if (lib.characterIntro[name]) {
	// 	return lib.characterIntro[name];
	// }
	const tags = get.character(name, 4);
	if (tags) {
		for (let i = 0; i < tags.length; i++) {
			if (tags[i].startsWith('des:')) {
				return tags[i].slice(4);
			}
		}
	}
	while (name.includes('_') && !lib.characterIntro[name]) {
		name = name.slice(name.indexOf('_') + 1);
	}
	if (lib.characterIntro[name]) {
		return lib.characterIntro[name];
	}
	return '暂无武将介绍';
};
{
	//整合数据函数
	// const YB_characterIntro=function(a,b,c,d){
	// 	const result = {};
	// 	const objects =[a,b,c,d];
	// }
}
const characterIntro = function (name) {
	let str = '';
	if (lib.characterCopyright[name]) {
		//版权信息
		str += lib.characterCopyright[name];
		str += '<br>';
	}
	if (lib.characterCitetext[name]) {
		//上引文
		str += lib.characterCitetext[name];
		str += '<br>';
	}
	if (lib.characterUndertext[name]) {
		//下引文
		str += lib.characterUndertext[name];
		str += '<br>';
	}
	if (lib.characterLightext[name] && lib.characterLightext[name](name)) {
		//缘分点亮
		str += lib.characterLightext[name](name)[lib.characterLightext[name](name).length - 1];
		str += '<br>';
	}
	//正片开始
	if (lib.characterIntro[name]) {
		return str + lib.characterIntro[name];
	}
	const tags = get.character(name, 4);
	if (tags) {
		for (let i = 0; i < tags.length; i++) {
			if (tags[i].startsWith('des:')) {
				return tags[i].slice(4);
			}
		}
	}
	while (name.includes('_') && !lib.characterIntro[name]) {
		name = name.slice(name.indexOf('_') + 1);
	}
	if (lib.characterIntro[name]) {
		return str + lib.characterIntro[name];
	}
	return str + '暂无武将介绍';
};
const nodeintro = function (node, simple, evt) {
	const uiintro = ui.create.dialog('hidden', 'notouchscroll');
	if (node.classList.contains('player') && !node.name) {
		return uiintro;
	}
	let i, translation, intro, str;
	if (node._nointro) {
		return;
	}
	if (typeof node._customintro == 'function') {
		if (node._customintro(uiintro, evt) === false) {
			return;
		}
		if (evt) {
			lib.placePoppedDialog(uiintro, evt);
		}
	} else if (Array.isArray(node._customintro)) {
		let caption = node._customintro[0];
		let content = node._customintro[1];
		if (typeof caption == 'function') {
			caption = caption(node);
		}
		if (typeof content == 'function') {
			content = content(node);
		}
		uiintro.add(caption);
		uiintro.add('<div class="text center" style="padding-bottom:5px">' + content + '</div>');
	} else if (node.classList.contains('player') || node.linkplayer) {
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
		uiintro.add(capt);
		if (lib.characterTitle[node.name]) {
			uiintro.addText(get.colorspan(lib.characterTitle[node.name]));
		}
		if (lib.characterAppend[node.name]) {
			uiintro.addText(get.colorspan(lib.characterAppend[node.name]));
		}
		if (lib.characterCitetext[node.name]) {
			uiintro.addText(get.colorspan(lib.characterCitetext[node.name]));
		}
		if (lib.characterLightext[node.name1] && lib.characterLightext[node.name1](node)) {
			uiintro.addText(get.colorspan(lib.characterLightext[node.name1](node)[lib.characterLightext[node.name1](node).length - 1]));
		}
		// if (lib.characterLightext[node.name1]) {
		// 	uiintro.addText(get.colorspan(lib.characterLightext[node.name1]()[lib.characterLightext[node.name1].length]));
		// }
		if (get.characterInitFilter(node.name)) {
			const initFilters = get.characterInitFilter(node.name).filter((tag) => {
				if (!lib.characterInitFilter[node.name]) {
					return true;
				}
				return lib.characterInitFilter[node.name](tag) !== false;
			});
			if (initFilters.length) {
				const str = initFilters.reduce((strx, stry) => strx + lib.InitFilter[stry] + '<br>', '').slice(0, -4);
				uiintro.addText(str);
			}
		}
		if (!node.noclick) {
			const allShown = node.isUnderControl() || (!game.observe && game.me && game.me.hasSkillTag('viewHandcard', null, node, true));
			const shownHs = node.getShownCards();
			if (shownHs.length) {
				uiintro.add('<div class="text center">明置的手牌</div>');
				uiintro.addSmall(shownHs);
				if (allShown) {
					const hs = node.getCards('h');
					hs.removeArray(shownHs);
					if (hs.length) {
						uiintro.add('<div class="text center">其他手牌</div>');
						uiintro.addSmall(hs);
					}
				}
			} else if (allShown) {
				const hs = node.getCards('h');
				if (hs.length) {
					uiintro.add('<div class="text center">手牌</div>');
					uiintro.addSmall(hs);
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
					uiintro.add(forbidstr);
				} else if (!skills2.includes(skills[i])) {
					if (lib.skill[skills[i]].preHidden && get.mode() == 'guozhan') {
						uiintro.add('<div><div class="skill" style="opacity:0.5">' + translation + '</div><div><span style="opacity:0.5">' + get.skillInfoTranslation(skills[i], node) + '</span><br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">预亮技能</div></div></div>');
						const underlinenode = uiintro.content.lastChild.querySelector('.underlinenode');
						if (_status.prehidden_skills.includes(skills[i])) {
							underlinenode.classList.remove('on');
						}
						underlinenode.link = skills[i];
						underlinenode.listen(ui.click.hiddenskill);
					} else {
						uiintro.add('<div style="opacity:0.5"><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], node) + '</div></div>');
					}
				} else if (lib.skill[skills[i]].temp || !node.skills.includes(skills[i]) || lib.skill[skills[i]].thundertext) {
					if (lib.skill[skills[i]].frequent || lib.skill[skills[i]].subfrequent) {
						uiintro.add('<div><div class="skill thundertext thunderauto">' + translation + '</div><div class="thundertext thunderauto">' + get.skillInfoTranslation(skills[i], node) + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">自动发动</div></div></div>');
						const underlinenode = uiintro.content.lastChild.querySelector('.underlinenode');
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
						uiintro.add('<div><div class="skill thundertext thunderauto">' + translation + '</div><div class="thundertext thunderauto">' + get.skillInfoTranslation(skills[i], node) + '</div></div>');
					}
				} else if (lib.skill[skills[i]].frequent || lib.skill[skills[i]].subfrequent) {
					uiintro.add('<div><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], node) + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">自动发动</div></div></div>');
					const underlinenode = uiintro.content.lastChild.querySelector('.underlinenode');
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
					const intronode = uiintro.add('<div><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], node) + '<br><div class="menubutton skillbutton" style="position:relative;margin-top:5px">点击发动</div></div></div>').querySelector('.skillbutton');
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
					uiintro.add('<div><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i], node) + '</div></div>');
				}
				if (lib.translate[skills[i] + '_append']) {
					uiintro._place_text = uiintro.add('<div class="text">' + lib.translate[skills[i] + '_append'] + '</div>');
				}
			}
		}
		// if(get.is.phoneLayout()){
		// 	var storage=node.storage;
		// 	for(i in storage){
		// 		if(get.info(i)&&get.info(i).intro){
		// 			intro=get.info(i).intro;
		// 			if(node.getSkills().concat(lib.skill.global).includes(i)==false&&!intro.show) continue;
		// 			var name=intro.name?intro.name:get.translation(i);
		// 			if(typeof name=='function'){
		// 				name=name(storage[i],node);
		// 			}
		// 			translation='<div><div class="skill">『'+name.slice(0,2)+'』</div><div>';
		// 			var stint=get.storageintro(intro.content,storage[i],node,null,i);
		// 			if(stint){
		// 				translation+=stint+'</div></div>';
		// 				uiintro.add(translation);
		// 			}
		// 		}
		// 	}
		// }
		if (lib.characterUndertext[node.name]) {
			uiintro.addText(get.colorspan(lib.characterUndertext[node.name]));
		}
		if (lib.config.right_range && _status.gameStarted) {
			uiintro.add(ui.create.div('.placeholder'));
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
			(function () {
				num = 0;
				for (let j = 0; j < node.stat.length; j++) {
					if (typeof node.stat[j].damage == 'number') {
						num += node.stat[j].damage;
					}
				}
				td.innerHTML = num;
			})();
			tr.appendChild(td);
			table.style.width = 'calc(100% - 20px)';
			table.style.marginLeft = '10px';
			uiintro.content.appendChild(table);
			if (!lib.config.show_favourite) {
				table.style.paddingBottom = '5px';
			}
		}
		if (!simple || get.is.phoneLayout()) {
			const es = node.getCards('e');
			for (let i = 0; i < es.length; i++) {
				const special = [es[i]].concat(es[i].cards || []).find((j) => j.name == es[i].name && lib.card[j.name]?.cardPrompt);
				let str = special ? lib.card[special.name].cardPrompt(special) : lib.translate[es[i].name + '_info'];
				uiintro.add('<div><div class="skill">' + es[i].outerHTML + '</div><div>' + str + '</div></div>');
				uiintro.content.lastChild.querySelector('.skill>.card').style.transform = '';
				if (lib.translate[es[i].name + '_append']) {
					uiintro.add('<div class="text">' + lib.translate[es[i].name + '_append'] + '</div>');
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
					uiintro.add('<div><div class="skill">' + html + '</div><div>' + lib.translate[js[i].viewAs] + ':' + lib.translate[js[i].viewAs + '_info'] + '</div></div>');
				} else {
					uiintro.add('<div><div class="skill">' + js[i].outerHTML + '</div><div>' + lib.translate[js[i].name + '_info'] + '</div></div>');
				}
				uiintro.content.lastChild.querySelector('.skill>.card').style.transform = '';
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
						uiintro.noresume = true;
						const rect = this.link.getBoundingClientRect();
						ui.click.intro.call(this.link, {
							clientX: rect.left + rect.width,
							clientY: rect.top + rect.height / 2,
						});
						if (lib.config.touchscreen) {
							uiintro._close();
						}
					});
				}
				if (markCoutainer.childElementCount) {
					uiintro.addText('标记');
					uiintro.add(markCoutainer);
				}
			}
		}
		if (!game.observe && _status.gameStarted && game.me && node != game.me) {
			ui.throwEmotion = [];
			uiintro.addText('发送交互表情');
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
				uiintro._close();
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
			uiintro.content.appendChild(table);
			table = document.createElement('div');
			table.classList.add('add-setting');
			table.style.margin = '0';
			table.style.width = '100%';
			table.style.position = 'relative';
			let listi = ['wine', 'shoe'];
			if (game.me.storage.zhuSkill_shanli) {
				listi = ['yuxisx', 'jiasuo'];
			}
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
			uiintro.content.appendChild(table);
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
			uiintro.add(addFavourite);
		}
		if (!simple || get.is.phoneLayout()) {
			if ((lib.config.change_skin || lib.skin) && !node.isUnseen()) {
				let num = 1;
				let introadded = false;
				const createButtons = function (num, avatar2) {
					if (!introadded) {
						introadded = true;
						uiintro.add('<div class="text center">更改皮肤</div>');
					}
					const buttons = ui.create.div('.buttons.smallzoom.scrollbuttons');
					lib.setMousewheel(buttons);
					let nameskin = avatar2 ? node.name2 : node.name1;
					let nameskin2 = nameskin;
					let gzbool = false;
					if (nameskin.startsWith('gz_shibing')) {
						nameskin = nameskin.slice(3, 11);
					} else if (nameskin.startsWith('gz_')) {
						nameskin = nameskin.slice(3);
						gzbool = true;
					}
					for (let i = 0; i <= num; i++) {
						const button = ui.create.div('.button.character.pointerdiv', buttons, function () {
							if (this._link) {
								if (avatar2) {
									lib.config.skin[nameskin] = this._link;
									node.node.avatar2.style.backgroundImage = this.style.backgroundImage;
								} else {
									lib.config.skin[nameskin] = this._link;
									node.node.avatar.style.backgroundImage = this.style.backgroundImage;
								}
							} else {
								delete lib.config.skin[nameskin];
								if (avatar2) {
									if (gzbool && lib.character[nameskin2].hasSkinInGuozhan && lib.config.mode_config.guozhan.guozhanSkin) {
										node.node.avatar2.setBackground(nameskin2, 'character');
									} else {
										node.node.avatar2.setBackground(nameskin, 'character');
									}
								} else {
									if (gzbool && lib.character[nameskin2].hasSkinInGuozhan && lib.config.mode_config.guozhan.guozhanSkin) {
										node.node.avatar.setBackground(nameskin2, 'character');
									} else {
										node.node.avatar.setBackground(nameskin, 'character');
									}
								}
							}
							game.saveConfig('skin', lib.config.skin);
						});
						button._link = i;
						if (i) {
							button.setBackgroundImage('image/skin/' + nameskin + '/' + i + '.jpg');
						} else {
							if (gzbool && lib.character[nameskin2].hasSkinInGuozhan && lib.config.mode_config.guozhan.guozhanSkin) {
								button.setBackground(nameskin2, 'character', 'noskin');
							} else {
								button.setBackground(nameskin, 'character', 'noskin');
							}
						}
					}
					uiintro.add(buttons);
				};
				const loadImage = function (avatar2) {
					const img = new Image();
					img.onload = function () {
						num++;
						loadImage(avatar2);
					};
					img.onerror = function () {
						num--;
						if (num > 0) {
							createButtons(num, avatar2);
						}
						if (!avatar2) {
							if (!node.classList.contains('unseen2') && node.name2) {
								num = 1;
								loadImage(true);
							}
						}
					};
					let nameskin = avatar2 ? node.name2 : node.name1;
					let nameskin2 = nameskin;
					let gzbool = false;
					if (nameskin.startsWith('gz_shibing')) {
						nameskin = nameskin.slice(3, 11);
					} else if (nameskin.startsWith('gz_')) {
						nameskin = nameskin.slice(3);
						gzbool = true;
					}
					img.src = lib.assetURL + 'image/skin/' + nameskin + '/' + num + '.jpg';
				};
				if (lib.config.change_skin) {
					if (!node.isUnseen(0)) {
						loadImage();
					} else if (node.name2) {
						loadImage(true);
					}
				} else {
					setTimeout(function () {
						let nameskin1 = node.name1;
						let nameskin2 = node.name2;
						if (nameskin1 && nameskin1.startsWith('gz_')) {
							nameskin1 = nameskin1.slice(3);
						}
						if (nameskin2 && nameskin2.startsWith('gz_')) {
							nameskin2 = nameskin2.slice(3);
						}
						if (!node.isUnseen(0) && lib.skin[nameskin1]) {
							createButtons(lib.skin[nameskin1]);
						}
						if (!node.isUnseen(1) && lib.skin[nameskin2]) {
							createButtons(lib.skin[nameskin2], true);
						}
					});
				}
			}
		}
		uiintro.add(ui.create.div('.placeholder.slim'));
	} else if (node.classList.contains('mark') && node.info && node.parentNode && node.parentNode.parentNode && node.parentNode.parentNode.classList.contains('player')) {
		const info = node.info;
		const player = node.parentNode.parentNode;
		if (info.name) {
			if (typeof info.name == 'function') {
				const named = info.name(player.storage[node.skill], player);
				if (named) {
					uiintro.add(named);
				}
			} else {
				uiintro.add(info.name);
			}
		} else if (info.name !== false) {
			uiintro.add(get.translation(node.skill));
		}
		if (typeof info.id == 'string' && info.id.startsWith('subplayer') && player.isUnderControl(true) && player.storage[info.id] && !_status.video) {
			const storage = player.storage[info.id];
			uiintro.addText('当前体力:' + storage.hp + '/' + storage.maxHp);
			if (storage.hs.length) {
				uiintro.addText('手牌区');
				uiintro.addSmall(storage.hs);
			}
			if (storage.es.length) {
				uiintro.addText('装备区');
				uiintro.addSmall(storage.es);
			}
		}
		if (typeof info.mark == 'function') {
			const stint = info.mark(uiintro, player.storage[node.skill], player);
			if (stint) {
				const placetext = uiintro.add('<div class="text" style="display:inline">' + stint + '</div>');
				if (!stint.startsWith('<div class="skill"')) {
					uiintro._place_text = placetext;
				}
				// if(stint.length<=100){
				// 	uiintro.add('<div class="text center">'+stint+'</div>');
				// }
				// else{
				// 	uiintro.add('<div class="text">'+stint+'</div>');
				// }
			}
		} else {
			const stint = get.storageintro(info.content, player.storage[node.skill], player, uiintro, node.skill);
			if (stint) {
				if (stint[0] == '@') {
					uiintro.add('<div class="caption">' + stint.slice(1) + '</div>');
				} else {
					const placetext = uiintro.add('<div class="text" style="display:inline">' + stint + '</div>');
					if (!stint.startsWith('<div class="skill"')) {
						uiintro._place_text = placetext;
					}
				}
				// else if(stint.length<=100){
				// 	uiintro.add('<div class="text center">'+stint+'</div>');
				// }
				// else{
				// 	uiintro.add('<div class="text">'+stint+'</div>');
				// }
			}
		}
		uiintro.add(ui.create.div('.placeholder.slim'));
	} else if (node.classList.contains('card')) {
		//卡牌长按介绍
		if (ui.arena.classList.contains('observe') && node.parentNode.classList.contains('handcards')) {
			return;
		}
		let name = node.name;
		if (node.parentNode.cardMod) {
			let moded = false;
			for (let i in node.parentNode.cardMod) {
				const item = node.parentNode.cardMod[i](node);
				if (Array.isArray(item)) {
					moded = true;
					uiintro.add(item[0]);
					uiintro._place_text = uiintro.add('<div class="text" style="display:inline">' + item[1] + '</div>');
				}
			}
			if (moded) {
				return uiintro;
			}
		}
		if (node.link && node.link.name && lib.card[node.link.name]) {
			name = node.link.name;
		}
		const cardPosition = get.position(node);
		if ((cardPosition === 'e' || cardPosition === 'j') && node.viewAs && node.viewAs != name) {
			uiintro.add(get.translation(node.viewAs));
			let cardInfo = lib.card[node.viewAs], showCardIntro = true;
			const cardOwner = get.owner(node);
			if (cardInfo.blankCard) {
				if (cardOwner && !cardOwner.isUnderControl(true)) {
					showCardIntro = false;
				}
			}
			if (cardOwner) {
				const sourceVCard = cardOwner.getVCards(cardPosition).find((card) => card.cards?.includes(node));
				if (showCardIntro && sourceVCard) {
					uiintro.add('<div class="text center">(' + get.translation(get.translation(sourceVCard.cards)) + ')</div>');
				}
			}
			// uiintro.add(get.translation(node.viewAs)+'<br><div class="text center" style="padding-top:5px;">('+get.translation(node)+')</div>');
			uiintro.nosub = true;
			name = node.viewAs;
		} else {
			uiintro.add(get.translation(node));
		}
		if (node._banning) {
			const clickBanned = function () {
				const banned = lib.config[this.bannedname] || [];
				if (banned.includes(name)) {
					banned.remove(name);
				} else {
					banned.push(name);
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
			uiintro.contentContainer.listen(function (e) {
				ui.click.touchpop();
				e.stopPropagation();
			});
			for (let i = 0; i < modeorder.length; i++) {
				if (node._banning == 'online') {
					if (!lib.mode[modeorder[i]].connect) {
						continue;
					}
				} else if (modeorder[i] == 'connect' || modeorder[i] == 'brawl') {
					continue;
				}
				if (lib.config.all.mode.includes(modeorder[i])) {
					list.push(modeorder[i]);
				}
			}
			if (lib.card[name] && lib.card[name].type == 'trick') {
				list.push('zhinang_tricks');
			}
			const page = ui.create.div('.menu-buttons.configpopped', uiintro.content);
			let banall = false;
			for (let i = 0; i < list.length; i++) {
				const cfg = ui.create.div('.config', list[i] == 'zhinang_tricks' ? '设为智囊' : lib.translate[list[i]] + '模式', page);
				cfg.classList.add('toggle');
				if (list[i] == 'zhinang_tricks') {
					cfg.bannedname = (node._banning == 'offline' ? '' : 'connect_') + 'zhinang_tricks';
				} else if (node._banning == 'offline') {
					cfg.bannedname = list[i] + '_bannedcards';
				} else {
					cfg.bannedname = 'connect_' + list[i] + '_bannedcards';
				}
				cfg.listen(clickBanned);
				ui.create.div(ui.create.div(cfg));
				const banned = lib.config[cfg.bannedname] || [];
				if (banned.includes(name) == (list[i] == 'zhinang_tricks')) {
					cfg.classList.add('on');
					banall = true;
				}
			}
			ui.create.div('.menubutton.pointerdiv', banall ? '全部禁用' : '全部启用', uiintro.content, function () {
				if (this.innerHTML == '全部禁用') {
					for (let i = 0; i < page.childElementCount; i++) {
						if (page.childNodes[i].bannedname.indexOf('zhinang_tricks') == -1 && page.childNodes[i].bannedname && page.childNodes[i].classList.contains('on')) {
							clickBanned.call(page.childNodes[i]);
						}
					}
					this.innerHTML = '全部启用';
				} else {
					for (let i = 0; i < page.childElementCount; i++) {
						if (page.childNodes[i].bannedname.indexOf('zhinang_tricks') == -1 && page.childNodes[i].bannedname && !page.childNodes[i].classList.contains('on')) {
							clickBanned.call(page.childNodes[i]);
						}
					}
					this.innerHTML = '全部禁用';
				}
			}).style.marginTop = '-10px';
			ui.create.div('.placeholder.slim', uiintro.content);
		} else {
			if (lib.translate[name + '_info']) {
				if (!uiintro.nosub) {
					if (lib.card[name] && lib.card[name].derivation) {
						if (typeof lib.card[name].derivation == 'string') {
							uiintro.add('<div class="text center">来源:' + get.translation(lib.card[name].derivation) + '</div>');
						} else if (lib.card[name].derivationpack) {
							uiintro.add('<div class="text center">来源:' + get.translation(lib.card[name].derivationpack + '_card_config') + '包</div>');
						}
					}
					let typeinfo = '';
					if (lib.card[name] && lib.card[name].unique) {
						typeinfo += '特殊' + get.translation(lib.card[name].type) + '牌';
					} else if (lib.card[name] && lib.card[name].type && lib.translate[lib.card[name].type]) {
						typeinfo += get.translation(lib.card[name].type) + '牌';
					}
					const vcard = get
						.owner(node)
						?.getVCards(get.position(node))
						?.find((card) => card.cards?.includes(node));
					if (get.subtypes(vcard || node, get.owner(node))?.length) {
						typeinfo +=
							'-' +
							get
								.subtypes(vcard || node, get.owner(node))
								.map((type) => get.translation(type))
								.join('/');
					}
					if (typeinfo) {
						uiintro.add('<div class="text center">' + typeinfo + '</div>');
					}
					if (lib.card[name].unique && lib.card[name].type == 'equip') {
						if (lib.cardPile.guozhan && lib.cardPack.guozhan.includes(name)) {
							uiintro.add('<div class="text center">专属装备</div>').style.marginTop = '-5px';
						} else {
							uiintro.add('<div class="text center">特殊装备</div>').style.marginTop = '-5px';
						}
					}
					if (lib.card[name] && lib.card[name].addinfomenu) {
						uiintro.add('<div class="text center">' + lib.card[name].addinfomenu + '</div>');
					}
					if (get.subtype(name, false) == 'equip1') {
						let added = false;
						if (lib.card[node.name] && lib.card[node.name].distance) {
							const dist = lib.card[node.name].distance;
							if (dist.attackFrom) {
								added = true;
								uiintro.add('<div class="text center">攻击范围:' + (-dist.attackFrom + 1) + '</div>');
							}
						}
						if (!added) {
							uiintro.add('<div class="text center">攻击范围:1</div>');
						}
					}
				}
				if (lib.card[name].cardPrompt) {
					let str = lib.card[name].cardPrompt(node.link || node), placetext = uiintro.add('<div class="text" style="display:inline">' + str + '</div>');
					if (!str.startsWith('<div class="skill"')) {
						uiintro._place_text = placetext;
					}
				} else if (lib.translate[name + '_info']) {
					const placetext = uiintro.add('<div class="text" style="display:inline">' + lib.translate[name + '_info'] + '</div>');
					if (!lib.translate[name + '_info'].startsWith('<div class="skill"')) {
						uiintro._place_text = placetext;
					}
				}
				if (get.is.yingbianConditional(node.link || node)) {
					const yingbianEffects = get.yingbianEffects(node.link || node);
					if (!yingbianEffects.length) {
						const defaultYingbianEffect = get.defaultYingbianEffect(node.link || node);
						if (lib.yingbian.prompt.has(defaultYingbianEffect)) {
							yingbianEffects.push(defaultYingbianEffect);
						}
					}
					if (yingbianEffects.length && showCardIntro) {
						uiintro.add(`<div class="text" style="font-family: yuanli">应变:${yingbianEffects.map((value) => lib.yingbian.prompt.get(value)).join(';')}</div>`);
					}
				}
				if (lib.translate[name + '_append']) {
					uiintro.add('<div class="text" style="display:inline">' + lib.translate[name + '_append'] + '</div>');
				}
			}
			uiintro.add(ui.create.div('.placeholder.slim'));
		}
	} else if (node.classList.contains('character')) {
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
		uiintro.add(capt);
		if (lib.characterTitle[node.link]) {
			uiintro.addText(get.colorspan(lib.characterTitle[node.link]));
		}
		if (lib.characterAppend[node.link]) {
			uiintro.addText(get.colorspan(lib.characterAppend[node.link]));
		}
		if (lib.characterCitetext[node.link]) {
			uiintro.addText(get.colorspan(lib.characterCitetext[node.link]));
		}
		if (lib.characterLightext[node.link] && lib.characterLightext[node.link](node.link)) {
			uiintro.addText(get.colorspan(lib.characterLightext[node.link](node.link)[lib.characterLightext[node.link](node.link).length - 1]));
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
				uiintro.addText(str);
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
			uiintro.contentContainer.listen(function (e) {
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
			const page = ui.create.div('.menu-buttons.configpopped', uiintro.content);
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
			ui.create.div('.menubutton.pointerdiv', banall ? '全部禁用' : '全部启用', uiintro.content, function () {
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
			ui.create.div('.placeholder.slim', uiintro.content);
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
					uiintro.add('<div><div class="skill">' + translation + '</div><div>' + get.skillInfoTranslation(skills[i]) + '</div></div>');
					if (lib.translate[skills[i] + '_append']) {
						uiintro._place_text = uiintro.add('<div class="text">' + lib.translate[skills[i] + '_append'] + '</div>');
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
				uiintro.add(addFavourite);
			} else {
				uiintro.add(ui.create.div('.placeholder.slim'));
			}
			let addskin = false;
			if (node.parentNode.classList.contains('menu-buttons')) {
				addskin = !lib.config.show_charactercard;
			} else {
				addskin = lib.config.change_skin || lib.skin;
			}
			if (addskin && (!simple || get.is.phoneLayout())) {
				let num = 1;
				let introadded = false;
				let nameskin = node.link;
				let nameskin2 = nameskin;
				let gzbool = false;
				if (nameskin.startsWith('gz_shibing')) {
					nameskin = nameskin.slice(3, 11);
				} else if (nameskin.startsWith('gz_')) {
					nameskin = nameskin.slice(3);
					gzbool = true;
				}
				const createButtons = function (num) {
					if (!num) {
						return;
					}
					if (!introadded) {
						introadded = true;
						uiintro.add('<div class="text center">更改皮肤</div>');
					}
					const buttons = ui.create.div('.buttons.smallzoom.scrollbuttons');
					lib.setMousewheel(buttons);
					for (let i = 0; i <= num; i++) {
						const button = ui.create.div('.button.character.pointerdiv', buttons, function () {
							if (this._link) {
								lib.config.skin[nameskin] = this._link;
								node.style.backgroundImage = this.style.backgroundImage;
								game.saveConfig('skin', lib.config.skin);
							} else {
								delete lib.config.skin[nameskin];
								if (gzbool && lib.character[nameskin2].hasSkinInGuozhan && lib.config.mode_config.guozhan.guozhanSkin) {
									node.setBackground(nameskin2, 'character');
								} else {
									node.setBackground(nameskin, 'character');
								}
								game.saveConfig('skin', lib.config.skin);
							}
						});
						button._link = i;
						if (i) {
							button.setBackgroundImage('image/skin/' + nameskin + '/' + i + '.jpg');
						} else {
							if (gzbool && lib.character[nameskin2].hasSkinInGuozhan && lib.config.mode_config.guozhan.guozhanSkin) {
								button.setBackground(nameskin2, 'character', 'noskin');
							} else {
								button.setBackground(nameskin, 'character', 'noskin');
							}
						}
					}
					uiintro.add(buttons);
				};
				const loadImage = function () {
					const img = new Image();
					img.onload = function () {
						num++;
						loadImage();
					};
					img.onerror = function () {
						num--;
						createButtons(num);
					};
					img.src = lib.assetURL + 'image/skin/' + nameskin + '/' + num + '.jpg';
				};
				if (lib.config.change_skin) {
					loadImage();
				} else {
					setTimeout(function () {
						createButtons(lib.skin[nameskin]);
					});
				}
			}
		}
		if (lib.characterUndertext[node.link]) {
			uiintro.addText(get.colorspan(lib.characterUndertext[node.link]));
		}
	} else if (node.classList.contains('equips') && ui.arena.classList.contains('selecting')) {
		(function () {
			uiintro.add('选择装备');
			uiintro.addSmall(
				Array.from(node.childNodes).filter((node) => !node.classList.contains('emptyequip') && !node.classList.contains('feichu')),
				true,
			);
			uiintro.clickintro = true;
			ui.control.hide();
			uiintro._onclose = function () {
				ui.control.show();
			};
			let confirmbutton;
			for (let i = 0; i < uiintro.buttons.length; i++) {
				const button = uiintro.buttons[i];
				button.classList.add('pointerdiv');
				if (button.link.classList.contains('selected')) {
					button.classList.add('selected');
				}
				button.listen(function (e) {
					ui.click.card.call(this.link, 'popequip');
					ui.click.window.call(ui.window, e);
					if (this.link.classList.contains('selected')) {
						this.classList.add('selected');
					} else {
						this.classList.remove('selected');
					}
					if (ui.confirm && ui.confirm.str && ui.confirm.str.includes('o')) {
						confirmbutton.classList.remove('disabled');
					} else {
						confirmbutton.classList.add('disabled');
					}
				});
			}
			const buttoncontainer = uiintro.add(ui.create.div());
			buttoncontainer.style.display = 'block';
			confirmbutton = ui.create.div(
				'.menubutton.large.pointerdiv',
				'确定',
				function () {
					if (ui.confirm && ui.confirm.str && ui.confirm.str.includes('o')) {
						uiintro._clickintro();
						ui.click.ok(ui.confirm.firstChild);
					}
				},
				buttoncontainer,
			);
			confirmbutton.style.position = 'relative';
			setTimeout(function () {
				if (ui.confirm && ui.confirm.str && ui.confirm.str.includes('o')) {
					confirmbutton.classList.remove('disabled');
				} else {
					confirmbutton.classList.add('disabled');
				}
			}, 300);
		})();
	} else if (node.classList.contains('identity') && node.dataset.career) {
		const career = node.dataset.career;
		uiintro.add(get.translation(career));
		uiintro.add('<div class="text center" style="padding-bottom:5px">' + lib.translate['_' + career + '_skill_info'] + '</div>');
	} else if (node.classList.contains('skillbar')) {
		if (node == ui.friendBar) {
			uiintro.add('友方怒气值');
			uiintro.add('<div class="text center" style="padding-bottom:5px">' + _status.friendRage + '/100</div>');
		} else if (node == ui.enemyBar) {
			uiintro.add('敌方怒气值');
			uiintro.add('<div class="text center" style="padding-bottom:5px">' + _status.enemyRage + '/100</div>');
		}
	} else if (node.parentNode == ui.historybar) {
		if (node.dead) {
			if (!node.source || node.source == node.player) {
				uiintro.add('<div class="text center">' + get.translation(node.player) + '阵亡</div>');
				uiintro.addSmall([node.player]);
			} else {
				uiintro.add('<div class="text center">' + get.translation(node.player) + '被' + get.translation(node.source) + '杀害</div>');
				uiintro.addSmall([node.source]);
			}
		}
		if (node.skill) {
			uiintro.add('<div class="text center">' + get.translation(node.skill) + '</div>');
			uiintro._place_text = uiintro.add('<div class="text" style="display:inline">' + get.translation(node.skill, 'info') + '</div>');
		}
		if (node.targets && get.itemtype(node.targets) == 'players') {
			uiintro.add('<div class="text center">目标</div>');
			uiintro.addSmall(node.targets);
		}
		if (node.players && node.players.length > 1) {
			uiintro.add('<div class="text center">使用者</div>');
			uiintro.addSmall(node.players);
		}
		if (node.cards && node.cards.length) {
			uiintro.add('<div class="text center">卡牌</div>');
			uiintro.addSmall(node.cards);
		}
		for (let i = 0; i < node.added.length; i++) {
			uiintro.add(node.added[i]);
		}
		if (node.added.length) {
			uiintro.add(ui.create.div('.placeholder.slim'));
		}
		if (uiintro.content.firstChild) {
			uiintro.content.firstChild.style.paddingTop = '3px';
		}
	} else if (node.classList.contains('nodeintro')) {
		if (node.nodeTitle) {
			uiintro.add(node.nodeTitle);
		}
		uiintro._place_text = uiintro.add('<div class="text">' + node.nodeContent + '</div>');
	}
	if (lib.config.touchscreen) {
		lib.setScroll(uiintro.contentContainer);
	}
	return uiintro;
};
const typeimage = function (pagename, filename) {
	for (let i in pagename.character) {
		if (pagename.character[i].YB_mjz) {
			// return ;
			const infoy = pagename.character[i].YB_mjz;
			pagename.character[i].img = `image/character/${infoy}.jpg`;
			// pagename.character[i].die = `${infoy}`;
			if (!pagename.character[i].dieAudios) {
				pagename.character[i].dieAudios = [infoy];
			}
		} else {
			if (Array.isArray(pagename.character[i])) {
				const infoy = pagename.character[i][4];
				for (const infox of infoy) {
					if (infox.startsWith('YB_mjz:')) {
						// return ;
						const char = infox.slice(7);
						pagename.character[i][4].push(`img:image/character/${char}.jpg`);
						pagename.character[i][4].push(`die:${char}`);
						// if(!infox.startsWith('dieAudios:')){
						// }
					}
				}
			}
		}
	}
	if (pagename.characterSubstitute && Object.keys(pagename.characterSubstitute).length) {
		const substitute = pagename.characterSubstitute;
		for (let i in substitute) {
			for (let k = 0; k < substitute[i].length; k++) {
				if (Array.isArray(substitute[i][k])) {
					const infoy = substitute[i][k][1];
					for (const infox of infoy) {
						if (infox.startsWith('YB_mjz:')) {
							// return ;
							const char = infox.slice(7);
							pagename.characterSubstitute[i][k][1].push(`img:image/character/${char}.jpg`);
							// if(noneStartWithPrefix(pagename.characterSubstitute[i][k][1],'die:')){
							// 	pagename.characterSubstitute[i][k][1].push(`die:../../audio/die/${i}.mp3`);
							// }
						}
					}
				}
			}
		}
	}
	/**
	 * 检查数组中所有字符串是否均不以指定前缀开头
	 * @param {Array} arr - 要检查的数组
	 * @param {string} prefix - 需要判断的前缀
	 * @returns {boolean} - 如果所有字符串都不以指定前缀开头则返回true,否则返回false
	 */
	function noneStartWithPrefix(arr, prefix) {
		// 确保prefix是字符串
		const checkPrefix = String(prefix);
		return arr.every((item) => {
			// 检查元素是否为字符串且不以指定前缀开头
			return typeof item === 'string' && !item.startsWith(checkPrefix);
		});
	}
	// // 示例用法
	// const testArray1 = ['abc', 'def', 'ghi'];
	// const testArray2 = ['ext:abc', 'def', 'ghi'];
	// const testArray3 = ['ext:123', 'ext:456'];
	// console.log(noneStartWithExt(testArray1)); // true
	// console.log(noneStartWithExt(testArray2)); // false
	// console.log(noneStartWithExt(testArray3)); // false
	for (let i in pagename.character) {
		if (Array.isArray(pagename.character[i])) {
			const infoy = pagename.character[i][4];
			if (noneStartWithPrefix(infoy, 'YB_mjz:')) {
				if (noneStartWithPrefix(infoy, 'ext:')) {
					pagename.character[i][4].push(`ext:夜白神略/image/${filename}/${i}.jpg`);
				}
				if (noneStartWithPrefix(infoy, 'die:')) {
					pagename.character[i][4].push(`die:夜白神略/audio/die/${i}.mp3`);
				}
			}
		} else {
			if (!pagename.character[i].YB_mjz) {
				if (!pagename.character[i].img) {
					pagename.character[i].img = `extension/夜白神略/image/${filename}/${i}.jpg`;
				}
				if (!pagename.character[i].die) {
					pagename.character[i].dieAudios = [`extension/夜白神略/audio/die/${i}.mp3`];
				}
			}
		}
	}
	if (pagename.characterSubstitute && Object.keys(pagename.characterSubstitute).length) {
		const substitute = pagename.characterSubstitute;
		for (let i in substitute) {
			for (let k = 0; k < substitute[i].length; k++) {
				if (Array.isArray(substitute[i][k])) {
					const infoy = substitute[i][k][1];
					if (noneStartWithPrefix(infoy, 'YB_mjz:')) {
						if (noneStartWithPrefix(infoy, 'ext:')) {
							pagename.characterSubstitute[i][k][1].push(`img:extension/夜白神略/image/${filename}/${pagename.characterSubstitute[i][k][0]}.jpg`);
						}
						if (noneStartWithPrefix(infoy, 'die:')) {
							pagename.characterSubstitute[i][k][1].push(`die:夜白神略/audio/die/${i}.mp3`);
						}
					}
				}
			}
		}
	}
};
