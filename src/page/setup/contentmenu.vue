<template>
  <teleport to="body">
    <ul
      ref="menuEl"
      class="contentmenu"
      id="avue-data-menu"
      :class="{ 'contentmenu--up': menuOpenUp }"
      :style="menuStyle"
      @click="closeMenu"
      @contextmenu.prevent.stop="closeMenu">
    <!-- 图层排序 -->
    <li class="contentmenu__item">
      <el-icon>
        <el-icon-sort />
      </el-icon>
      <span>图层</span>
      <el-icon class="contentmenu__list--icon">
        <el-icon-caret-right />
      </el-icon>
      <ul class="contentmenu contentmenu__list">
        <li class="contentmenu__item" @click="handleTop()">
          <el-icon>
            <el-icon-arrow-up />
          </el-icon>
          置顶
          <span class="contentmenu__shortcut">Ctrl+↑</span>
        </li>
        <li class="contentmenu__item" @click="handleBottom()">
          <el-icon>
            <el-icon-arrow-down />
          </el-icon>
          置底
          <span class="contentmenu__shortcut">Ctrl+↓</span>
        </li>
        <li class="contentmenu__item" @click="handleStepTop()">
          <el-icon>
            <el-icon-arrow-up />
          </el-icon>
          上移一层
          <span class="contentmenu__shortcut">Shift+↑</span>
        </li>
        <li class="contentmenu__item" @click="handleStepBottom()">
          <el-icon>
            <el-icon-arrow-down />
          </el-icon>
          下移一层
          <span class="contentmenu__shortcut">Shift+↓</span>
        </li>
      </ul>
    </li>

    <!-- 编辑操作 -->
    <li class="contentmenu__item">
      <el-icon>
        <el-icon-edit />
      </el-icon>
      <span>编辑</span>
      <el-icon class="contentmenu__list--icon">
        <el-icon-caret-right />
      </el-icon>
      <ul class="contentmenu contentmenu__list">
        <li class="contentmenu__item" @click="handleRplica()">
          <i class="iconfont icon-copy"></i>
          复制
          <span class="contentmenu__shortcut">Ctrl+C</span>
        </li>
        <li class="contentmenu__item" @click="handleShear()">
          <i class="iconfont icon-shear"></i>
          剪切
          <span class="contentmenu__shortcut">Ctrl+X</span>
        </li>
        <li class="contentmenu__item" @click="handleCopy()">
          <i class="iconfont icon-copy1"></i>
          拷贝
          <span class="contentmenu__shortcut">Ctrl+D</span>
        </li>
        <li class="contentmenu__item" v-if="contain.cacheList.copy" @click="handlePaste()">
          <i class="iconfont icon-paste"></i>
          粘贴
          <span class="contentmenu__shortcut">Ctrl+V</span>
        </li>
        <li class="contentmenu__separator"></li>
        <li class="contentmenu__item" @click="handleDel()">
          <el-icon>
            <el-icon-delete />
          </el-icon>
          删除
          <span class="contentmenu__shortcut">Delete</span>
        </li>
      </ul>
    </li>

    <li class="contentmenu__separator"></li>

    <!-- 常用操作 -->
    <li class="contentmenu__item" @click="contain.handleParams('lock')">
      <el-icon>
        <el-icon-lock />
      </el-icon>
      {{ contain.activeObj.lock ? "解锁" : "锁定" }}
      <span class="contentmenu__shortcut">Ctrl+L</span>
    </li>
    <li class="contentmenu__item" @click="contain.handleParams('display')">
      <el-icon>
        <el-icon-view />
      </el-icon>
      {{ contain.activeObj.display ? "显示" : "隐藏" }}
      <span class="contentmenu__shortcut">Ctrl+H</span>
    </li>
    <li class="contentmenu__item" @click="contain.isFolder ? handleLogout() : handleCompose()">
      <el-icon>
        <el-icon-folder />
      </el-icon>
      {{ contain.isFolder ? "解散" : "组合" }}
      <span class="contentmenu__shortcut">Ctrl+G</span>
    </li>
    <li
      class="contentmenu__item"
      @click="displayMode ? handleExitSoloDisplay() : handleSoloDisplay()">
      <el-icon>
        <el-icon-view />
      </el-icon>
      {{ displayMode ? "退出单显" : "单显" }}
      <span class="contentmenu__shortcut">{{ displayMode ? "Ctrl+Shift+E" : "Ctrl+Shift+H" }}</span>
    </li>

    <!-- 文件夹子图层选择 -->
    <li class="contentmenu__item" v-if="moveGroupList.length > 0">
      <el-icon>
        <el-icon-location />
      </el-icon>
      <span>移动分组</span>
      <el-icon class="contentmenu__list--icon">
        <el-icon-caret-right />
      </el-icon>
      <ul class="contentmenu contentmenu__list">
        <li
          class="contentmenu__item"
          v-for="group in moveGroupList"
          :key="group.id || '__default__'"
          @click="handleMoveGroup(group)">
          <el-icon>
            <el-icon-monitor />
          </el-icon>
          {{ group.name }}
        </li>
      </ul>
    </li>

    <li class="contentmenu__item" v-if="contain.isFolder && folderChildren.length > 0">
      <el-icon>
        <el-icon-document />
      </el-icon>
      <span>选择图层</span>
      <el-icon class="contentmenu__list--icon">
        <el-icon-caret-right />
      </el-icon>
      <ul class="contentmenu contentmenu__list">
        <li
          class="contentmenu__item"
          v-for="child in folderChildren"
          :key="child.index"
          @click="handleSelectChild(child)"
          @mouseover="mouseOver(child)"
          @mouseout="mouseOut(child)">
          <el-icon>
            <el-icon-files v-if="child.children && child.children.length > 0" />
            <el-icon-document v-else />
          </el-icon>
          {{ child.name }}
        </li>
      </ul>
    </li>

    <li class="contentmenu__separator"></li>

    <!-- 交互配置 -->
    <li class="contentmenu__item" v-if="!contain.isFolder">
      <el-icon>
        <el-icon-pointer />
      </el-icon>
      <span>交互</span>
      <el-icon class="contentmenu__list--icon">
        <el-icon-caret-right />
      </el-icon>
      <ul class="contentmenu contentmenu__list">
        <li
          class="contentmenu__item"
          v-if="contain.validProp('dataList')"
          @click="handleOpen('data')">
          <el-icon>
            <el-icon-document-copy />
          </el-icon>
          添加数据
        </li>
        <li class="contentmenu__item" @click="handleOpen('transfer')">
          <el-icon>
            <el-icon-edit />
          </el-icon>
          添加交互
        </li>
        <li class="contentmenu__separator"></li>
        <li
          class="contentmenu__item"
          v-if="contain.validProp('dataList')"
          @click="handleCopyData()">
          <i class="iconfont icon-copy"></i>
          复制数据配置
        </li>
        <li
          class="contentmenu__item"
          v-if="contain.validProp('dataList') && contain.cacheList.data"
          @click="handlePasteData()">
          <i class="iconfont icon-paste"></i>
          粘贴数据配置
        </li>
      </ul>
    </li>

    <!-- 位置对齐 -->
    <li class="contentmenu__item">
      <el-icon>
        <el-icon-position />
      </el-icon>
      <span>位置</span>
      <el-icon class="contentmenu__list--icon">
        <el-icon-caret-right />
      </el-icon>
      <ul class="contentmenu contentmenu__list">
        <li class="contentmenu__item" @click="handlePostionSelect('left')">
          <svg-icon icon-class="pos1" />
          左对齐
        </li>
        <li class="contentmenu__item" @click="handlePostionSelect('center')">
          <svg-icon icon-class="pos5" />
          水平对齐
        </li>
        <li class="contentmenu__item" @click="handlePostionSelect('right')">
          <svg-icon icon-class="pos3" />
          右对齐
        </li>
        <li class="contentmenu__item" @click="handlePostionSelect('top')">
          <svg-icon icon-class="pos4" />
          顶部对齐
        </li>
        <li class="contentmenu__item" @click="handlePostionSelect('middle')">
          <svg-icon icon-class="pos2" />
          垂直对齐
        </li>
        <li class="contentmenu__item" @click="handlePostionSelect('bottom')">
          <svg-icon icon-class="pos6" />
          底部对齐
        </li>
      </ul>
    </li>

    <!-- 工具 -->
    <li class="contentmenu__item" v-if="!contain.isFolder">
      <el-icon>
        <el-icon-tools />
      </el-icon>
      <span>工具</span>
      <el-icon class="contentmenu__list--icon">
        <el-icon-caret-right />
      </el-icon>
      <ul class="contentmenu contentmenu__list">
        <li class="contentmenu__item" @click="handleRefreshData()">
          <el-icon>
            <el-icon-refresh />
          </el-icon>
          刷新组件数据
        </li>
        <li class="contentmenu__item" @click="handleCopyJson()">
          <el-icon>
            <el-icon-document-copy />
          </el-icon>
          复制组件JSON
        </li>
      </ul>
    </li>
    </ul>
  </teleport>
</template>

<script>
import { dataURLtoFile, createFile, uuid } from "@/utils/utils";
import html2canvas from "html2canvas-pro";
import { uploadImg } from "@/api/visual";
export default {
  name: "contentmenu",
  inject: ["contain"],
  data() {
    return {
      displayBackup: {},
      displayMode: false,
      menuStyle: {
        display: "none",
      },
      menuOpenUp: false,
      selectCount: {
        x1: null,
        x2: null,
        y1: null,
        y2: null,
      },
    };
  },
  components: {},
  computed: {
    moveGroupList() {
      const currentGroup = this.contain.group || "";
      return (this.contain.config.group || []).filter(group => {
        return (group?.id || "") !== currentGroup;
      });
    },
    // 获取文件夹的所有子组件（扁平化）
    folderChildren() {
      if (!this.contain.isFolder || !this.contain.activeObj) {
        return [];
      }

      const activeObj = this.contain.activeObj;
      if (!activeObj.children || activeObj.children.length === 0) {
        return [];
      }

      // 递归获取所有子组件
      const getAllChildren = children => {
        let result = [];
        children.forEach(child => {
          result.push(child);
          if (child.children && child.children.length > 0) {
            result = result.concat(getAllChildren(child.children));
          }
        });
        return result;
      };

      return getAllChildren(activeObj.children);
    },
  },
  methods: {
    beforeOpen() {
      this.closeMenu();
    },
    openMenu(event) {
      const menu = this.$refs.menuEl;
      if (!menu) return;

      this.closeMenu();
      this.menuStyle = {
        display: "block",
        position: "fixed",
        left: "0px",
        top: "0px",
        visibility: "hidden",
        zIndex: 99999,
      };

      this.$nextTick(() => {
        const width = menu.offsetWidth;
        const height = menu.offsetHeight;
        const margin = 8;
        const openUp = event.clientY + height + margin > window.innerHeight;
        const openLeft = event.clientX + width + margin > window.innerWidth;
        const left = openLeft
          ? Math.max(event.clientX - width, margin)
          : Math.min(event.clientX, Math.max(window.innerWidth - width - margin, margin));
        const top = openUp
          ? Math.max(event.clientY - height, margin)
          : Math.min(event.clientY, Math.max(window.innerHeight - height - margin, margin));

        this.menuOpenUp = openUp;
        this.menuStyle = {
          display: "block",
          position: "fixed",
          left: `${left}px`,
          top: `${top}px`,
          visibility: "visible",
          zIndex: 99999,
        };

        document.addEventListener("pointerdown", this.handleOutsideClick);
        window.addEventListener("resize", this.closeMenu);
        window.addEventListener("scroll", this.closeMenu, true);
        document.addEventListener("keydown", this.handleMenuKeydown);
      });
    },
    closeMenu() {
      this.menuStyle = {
        display: "none",
      };
      this.menuOpenUp = false;
      document.removeEventListener("pointerdown", this.handleOutsideClick);
      window.removeEventListener("resize", this.closeMenu);
      window.removeEventListener("scroll", this.closeMenu, true);
      document.removeEventListener("keydown", this.handleMenuKeydown);
    },
    handleOutsideClick(e) {
      const menu = this.$refs.menuEl;
      if (!menu || menu.contains(e.target)) return;
      this.closeMenu();
    },
    handleMenuKeydown(e) {
      if (e.key === "Escape") {
        this.closeMenu();
      }
    },
    getImg(id) {
      return new Promise(resolve => {
        html2canvas(document.querySelector(id), {
          useCORS: true,
          backgroundColor: null,
          logging: false,
          allowTaint: true,
        }).then(canvas => {
          let result = canvas.toDataURL("image/jpeg", 0.1);
          if (result.length < 10) resolve("");
          var file = dataURLtoFile(result, new Date().getTime() + ".jpg");
          var formdata = new FormData();
          formdata.append("file", file);
          uploadImg(formdata).then(res => {
            const data = res.data.data;
            const url = data.link;
            resolve(url);
          });
        });
      });
    },
    handleOpen(type) {
      if (type == "data") {
        this.contain.menuTabs = "1";
        this.contain.handleSetting();
      } else if (type == "transfer") {
        this.contain.menuTabs = "2";
        this.$nextTick(() => {
          this.contain.$refs.transfer.open();
        });
      }
    },
    handleRotateX() {
      this.contain.active.forEach(ele => {
        let item = this.contain.findList(ele);
        item.component.rotateX = item.component.rotateX == 180 ? 0 : 180;
      });
    },
    handleRotateY() {
      this.contain.active.forEach(ele => {
        let item = this.contain.findList(ele);
        item.component.rotateY = item.component.rotateY == 180 ? 0 : 180;
      });
    },
    handlePostionSelect(postion) {
      if (this.contain.isSelectActive) {
        this.contain.activeIndex = null;
        this.handleCalcPostionSelect();
      } else {
        this.selectCount = {
          x1: 0,
          x2: this.contain.config.width - 10,
          y1: 0,
          y2: this.contain.config.height - 10,
        };
      }
      const x1 = this.selectCount.x1;
      const x2 = this.selectCount.x2;
      const y1 = this.selectCount.y1;
      const y2 = this.selectCount.y2;
      if (postion === "left") {
        this.handleMoveSelectList(x1, undefined, true, postion);
      } else if (postion === "center") {
        this.handleMoveSelectList(undefined, y1 + (y2 - y1) / 2, true, postion);
      } else if (postion === "right") {
        this.handleMoveSelectList(x2, undefined, true, postion);
      } else if (postion === "top") {
        this.handleMoveSelectList(undefined, y1, true, postion);
      } else if (postion === "middle") {
        this.handleMoveSelectList(x1 + (x2 - x1) / 2, undefined, true, postion);
      } else if (postion === "bottom") {
        this.handleMoveSelectList(undefined, y2, true, postion);
      }
    },
    handleMoveSelectList(left, top, type, postion) {
      this.contain.active.forEach(ele => {
        let item = this.contain.findList(ele);
        const component = item.component;
        //水平情况
        if (left !== undefined) {
          let baseLeft = Number(type ? left : (item.left + left).toFixed(2));
          if (postion === "right") {
            baseLeft = baseLeft - component.width;
          } else if (postion === "middle") {
            const obj_center = item.left + component.width / 2;
            baseLeft = item.left + (left - obj_center);
          }

          item.left = baseLeft;
        }
        //垂直情况
        if (top !== undefined) {
          let baseTop = Number(type ? top : (item.top + top).toFixed(2));
          if (postion === "bottom") {
            baseTop = baseTop - component.height;
          } else if (postion === "center") {
            const obj_middle = item.top + component.height / 2;
            baseTop = item.top + (top - obj_middle);
          }
          item.top = baseTop;
        }
      });
    },
    //计算多选状态下的最大边界值
    handleCalcPostionSelect() {
      this.selectCount = {
        x1: null,
        x2: null,
        y1: null,
        y2: null,
      };
      this.contain.active.forEach(ele => {
        ele = this.contain.findList(ele);
        const left = ele.left;
        const top = ele.top;
        const width = ele.component.width;
        const height = ele.component.height;
        if (!this.selectCount.x1) {
          this.selectCount = {
            x1: left,
            x2: left + width,
            y1: top,
            y2: top + height,
          };
        }
        if (this.selectCount.x1 > left) this.selectCount.x1 = left;
        if (this.selectCount.x2 < left + width) this.selectCount.x2 = left + width;
        if (this.selectCount.y1 > top) this.selectCount.y1 = top;
        if (this.selectCount.y2 < top + height) this.selectCount.y2 = top + height;
      });
    },
    handleStepBottom() {
      this.handleCommon(false, true);
    },
    handleStepTop() {
      this.handleCommon(true, true);
    },
    handleMoveGroup(group) {
      if (!group) return;
      this.$confirm(`是否移动到分组【${group.name}】？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const movedList = this.contain.moveActiveToGroup(group.id);
        if (movedList.length > 0) {
          const message = movedList.length > 1 ? "已批量移动多个图层" : "移动分组成功";
          this.$message.success(message);
        }
      });
    },
    //文件夹成组逻辑
    handleCompose() {
      this.$confirm(`是否组合所选择的图层?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let folder = createFile();
          folder.group = this.contain.group;
          // 收集所有要成组的元素信息
          let items = this.contain.active.map(ele => {
            let { itemList, itemIndex } = this.contain.findnav(ele);
            return { itemList, itemIndex, ele };
          });
          // 检查是否所有元素都在同一个列表中
          const firstList = items[0].itemList;
          const allSameList = items.every(item => item.itemList === firstList);
          if (!allSameList) {
            this.$message.warning("只能对同一层级的图层进行成组");
            return;
          }
          // 按索引从大到小排序，从后往前删除避免索引偏移
          items.sort((a, b) => b.itemIndex - a.itemIndex);
          // 记录最小索引位置，用于插入文件夹
          const minIndex = Math.min(...items.map(item => item.itemIndex));
          // 从后往前删除元素并添加到文件夹
          items.forEach(({ itemList, itemIndex }) => {
            let obj = itemList.splice(itemIndex, 1)[0];
            folder.children.unshift(obj); // unshift保持原有顺序
          });
          // 在最小索引位置插入文件夹
          firstList.splice(minIndex, 0, folder);
          this.contain.handleInitActive();
        })
        .catch(() => {});
    },
    //文件夹解散逻辑
    handleLogout() {
      let ele = this.contain.activeObj;
      this.$confirm(`是否解散【${ele.name}】图层?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let { itemList, itemIndex } = this.contain.findnav(ele.index);
          const list = this.deepClone(ele.children);
          // 删除文件夹并在原位置插入子元素，保持顺序
          itemList.splice(itemIndex, 1, ...list);
          this.contain.handleInitActive();
        })
        .catch(() => {});
    },
    //删除
    handleDel(tip = true) {
      const callback = () => {
        // 收集所有待删除项的信息
        const deleteItems = this.contain.active
          .map(ele => this.contain.findnav(ele))
          .filter(item => item && item.itemIndex !== -1);

        // 按 itemList 分组，同一列表内按索引降序排列（从后往前删）
        const groupedByList = new Map();
        deleteItems.forEach(item => {
          const list = item.itemList;
          if (!groupedByList.has(list)) {
            groupedByList.set(list, []);
          }
          groupedByList.get(list).push(item.itemIndex);
        });

        // 每个列表内从大到小排序后删除
        groupedByList.forEach((indexes, list) => {
          indexes
            .sort((a, b) => b - a)
            .forEach(index => {
              list.splice(index, 1);
            });
        });

        this.contain.handleInitActive();
      };
      if (tip) {
        this.$confirm(`是否删除所选图层?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            callback();
          })
          .catch(() => {});
      } else {
        callback();
      }
    },
    handleCopyData() {
      this.contain.cacheList.data = this.contain.activeObj.dataList;
      this.$message.success("复制数据配置成功");
    },
    handlePasteData() {
      if (!this.contain.cacheList.data) return;
      this.contain.activeObj.dataList = this.contain.cacheList.data;
      this.$message.success("粘贴数据配置成功");
    },
    //粘贴
    handlePaste(params = {}) {
      const { tip = "粘贴组件成功" } = params;
      this.beforeOpen && this.beforeOpen();
      if (!this.contain.cacheList.copy) return;
      let active = [];
      let { itemList = this.contain.nav } = this.contain.findnav(this.contain.activeIndex);
      const setItemParams = (list, { group }) => {
        list.forEach(item => {
          item.group = group;
          if (item.children) setItemParams(item.children, { group });
        });
      };
      this.contain.cacheList.copy.forEach(ele => {
        setItemParams([ele], { group: this.contain.group });
        itemList.unshift(ele);
        active.push(ele.index);
      });
      this.$nextTick(() => this.contain.selectNav(active));
      tip && this.$message.success(tip);
    },
    //剪切
    handleShear() {
      this.handleRplica({
        tip: "剪切组件成功",
        add: false,
        fn: () => this.handleDel(false),
      });
    },
    //拷贝
    handleRplica(params = {}) {
      const { tip = "复制组件成功", fn, add = true } = params;
      this.handleCopy({
        add,
        fn: list => {
          this.contain.cacheList.copy = list;
          tip && this.$message.success(tip);
          fn && fn();
        },
      });
    },
    //复制`
    handleCopy(params = {}) {
      const { fn, add = true } = params;
      let active = [];
      let fnList = [];
      const setItemParams = (list = [], isActice = true) => {
        list.forEach(ele => {
          const index = uuid();
          ele.index = index;
          if (isActice) active.push(index);
          if (ele.children) {
            ele.menu = false;
            setItemParams(ele.children, false);
          }
        });
      };
      this.contain.active.forEach(ele => {
        const { item, itemList } = this.contain.findnav(ele);
        let obj = this.deepClone(item);
        if (add) setItemParams([obj]);
        if (fn) {
          fnList.push(obj);
        } else {
          itemList.unshift(obj);
        }
      });
      if (fn) {
        fn(fnList);
      } else {
        this.$nextTick(() => this.contain.selectNav(active));
        this.$message.success("拷贝组件成功");
      }
    },
    // 图层的上下移动方法
    handleCommon(top = false, step = false) {
      this.contain.active.forEach(ele => {
        let { itemList, itemIndex } = this.contain.findnav(ele);
        let obj = itemList.splice(itemIndex, 1)[0];
        if (step) {
          itemList.splice(top ? itemIndex - 1 : itemIndex + 1, 0, obj);
        } else {
          itemList[top ? "unshift" : "push"](obj);
        }
      });
    },
    handleTop() {
      this.handleCommon(true);
    },
    handleBottom() {
      this.handleCommon();
    },
    // 单独显示
    handleSoloDisplay() {
      const activeObj = this.contain.activeObj;
      const isFolder = this.contain.isFolder;

      this.displayBackup = {};
      this.contain.allList.forEach(item => {
        this.displayBackup[item.index] = item.display;
      });

      // 备份背景配置
      this.displayBackup.backgroundColor = this.contain.config.backgroundColor;
      this.displayBackup.backgroundImage = this.contain.config.backgroundImage;

      // 进入单独显示模式
      this.displayMode = true;

      // 设置背景为黑色，去掉背景图片
      this.contain.config.backgroundColor = "#000000";
      this.contain.config.backgroundImage = "";

      if (isFolder) {
        // 如果是文件夹，显示文件夹和子组件
        const folderIndex = activeObj.index;
        this.contain.allList.forEach(item => {
          if (item.index === folderIndex) {
            // 显示文件夹本身
            item.display = false;
          } else if (this.isChildOfFolder(item, activeObj)) {
            // 显示文件夹下的子组件
            item.display = false;
          } else {
            // 隐藏其他组件
            item.display = true;
          }
        });
      } else {
        // 如果是单个组件，只显示该组件
        this.contain.allList.forEach(item => {
          item.display = item.index !== activeObj.index;
        });
      }

      this.$message.success("已进入单独显示模式");
    },
    // 判断是否是文件夹的子组件
    isChildOfFolder(item, folder) {
      if (!folder.children) return false;

      const checkChildren = children => {
        for (let child of children) {
          if (child.index === item.index) return true;
          if (child.children && checkChildren(child.children)) return true;
        }
        return false;
      };

      return checkChildren(folder.children);
    },
    // 退出单独显示
    handleExitSoloDisplay() {
      if (!this.displayMode) return;

      // 恢复原始显示状态
      if (this.displayBackup) {
        this.contain.allList.forEach(item => {
          item.display = this.displayBackup[item.index];
        });

        // 还原背景配置
        if (this.displayBackup.backgroundColor !== undefined) {
          this.contain.config.backgroundColor = this.displayBackup.backgroundColor;
        }
        if (this.displayBackup.backgroundImage !== undefined) {
          this.contain.config.backgroundImage = this.displayBackup.backgroundImage;
        }

        this.displayBackup = null;
      }

      // 退出单独显示模式
      this.displayMode = false;

      this.$message.success("已退出单独显示模式");
    },
    // 选择子组件
    handleSelectChild(child) {
      if (!child || !child.index) return;

      // 选中子组件
      this.contain.selectNav([child.index]);
    },

    mouseOver(item) {
      this.contain.activeOverIndex = item.index;
    },
    mouseOut(item) {
      this.contain.activeOverIndex = undefined;
    },
    // 刷新当前组件数据
    handleRefreshData() {
      const activeObj = this.contain.activeObj;
      if (!activeObj) {
        this.$message.warning("请先选择组件");
        return;
      }
      if (this.contain.handleRefresh) {
        this.contain
          .handleRefresh()
          .then(() => {
            this.$message.success("刷新组件数据成功");
          })
          .catch(() => {
            this.$message.error("刷新组件数据失败");
          });
      }
    },
    // 复制组件JSON配置
    handleCopyJson() {
      const activeObj = this.contain.activeObj;
      if (!activeObj) {
        this.$message.warning("请先选择组件");
        return;
      }
      const json = JSON.stringify(activeObj, null, 2);
      navigator.clipboard
        .writeText(json)
        .then(() => {
          this.$message.success("复制组件JSON成功");
        })
        .catch(() => {
          this.$message.error("复制失败，请手动复制");
        });
    },
  },
  beforeUnmount() {
    this.closeMenu();
  },
};
</script>

<style lang="scss">
.contentmenu {
  width: 190px;
  display: none;
  z-index: 99999;
  list-style: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 4px 0;
  background: var(--bg-color-secondary, #fff);
  color: var(--text-color-primary, #333);
  border-radius: 6px;
  border: 1px solid var(--border-color-dark, #333);
}
.contentmenu__list {
  display: none;
  position: absolute;
  top: -5px;
  left: 100%;
  padding-left: 5px;
  width: 190px;
  &--icon {
    position: absolute;
    right: 6px;
  }
}
.contentmenu--up {
  .contentmenu__list {
    top: auto;
    bottom: -5px;
  }
}
.contentmenu__item:hover > .contentmenu__list {
  display: block;
}
// 为二级菜单添加背景容器，避免鼠标移动间隙
.contentmenu__item > .contentmenu__list::before {
  content: "";
  position: absolute;
  top: 0;
  left: -10px;
  width: 15px;
  height: 100%;
}
.contentmenu__item {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10000;
  list-style: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.15s;
}

.contentmenu__item:hover {
  background-color: var(--bg-color-hover, #f5f7fa);
  color: var(--primary-color, #409eff);
}
.contentmenu__item {
  .el-icon,
  .iconfont {
    margin-right: 8px;
    font-size: 15px;
  }
}

.contentmenu__shortcut {
  color: var(--text-color-secondary, #909399);
  font-size: 11px;
  margin-left: auto;
  padding-left: 10px;
}

.contentmenu__separator {
  height: 1px;
  background: var(--border-color-base, #dcdfe6);
  margin: 4px 0;
  border: none;
  list-style: none;
}
</style>
