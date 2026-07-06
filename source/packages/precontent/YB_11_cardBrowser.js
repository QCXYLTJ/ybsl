import { lib, game, ui, get, ai, _status } from '../../../../../noname.js';
import { YB_tujian } from '../../pile/ybtujian.js';
import { YBSL_characterIntro } from '../function.js';
export { YB_11_cardBrowser };
/**
 * 新模式光速撤销,看看搞一个新乱斗模式
 * 再次更改计划,用于新模式
 * 现计划用于rpg设计
 * 原用于卡包浏览
 */
const YB_11_cardBrowser = function () {
	if (lib?.config?.extension_夜白神略_6attack == true) {
		game.addMode(
			'YB_6attack',
			{
				start() {
					'step 0';
					const dialog = ui.create.div('.yb6attack');

					dialog.innerHTML = '<br><div class="yb6attack_title">夜白神略</div>';

					ui.create.dialog(dialog);
					('step 1');
				},
				init() { },
			},
			{
				translate: 'rpg模拟器',
			},
		);
	}
};
