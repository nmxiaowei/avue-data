<template>
  <el-form label-position="left" label-width="90px">
    <el-collapse accordion>
      <div style="margin: 10px 0 10px 0">
        <el-button type="primary" @click="handleAdd()">新增大屏</el-button>
      </div>
      <el-form-item label="默认屏幕">
        <avue-select
          :dic="contain.config.group"
          v-model="contain.config.groupId"
          :empty-values="[null, undefined]"
          :props="{ label: 'name', value: 'id' }"
          placeholder="默认主屏幕"></avue-select>
      </el-form-item>
      <ul class="menu__ul" v-loading="groupLoading" v-bind="$loadingParams">
        <li
          @click="handleGroupChange(item)"
          :class="[
            'menu__item',
            { 'is-active': contain.group == item.id, 'has-screen-id': item.screenId },
          ]"
          v-for="(item, index) in contain.config.group"
          :key="index">
          <div v-if="item.id" class="item">
            <span class="menu__icon" @click="handleThumbnailClick(item)">
              <img
                v-if="item.thumbnail"
                :src="item.thumbnail"
                class="menu__thumbnail"
                alt="缩略图" />
              <svg-icon v-else icon-class="screen" />
              <span v-if="item.screenId" class="screen-id-indicator">●</span>
            </span>
          </div>
          <span v-else class="menu__icon" @click="handleThumbnailClick(item)">
            <img v-if="item.thumbnail" :src="item.thumbnail" class="menu__thumbnail" alt="缩略图" />
            <svg-icon v-else icon-class="screen" />
            <span v-if="item.screenId" class="screen-id-indicator">●</span>
          </span>
          <span class="menu__label">
            <input
              type="text"
              @keyup.enter="item.isname = false"
              v-if="item.isname"
              v-model="item.name" />
            <span v-else class="menu__name">
              {{ item.name }}
              <el-tooltip v-if="!item.id" content="主屏幕上组件和其他屏幕共享" placement="top">
                <el-icon style="color: var(--primary-color); margin-left: 4px; cursor: help">
                  <el-icon-info-filled />
                </el-icon>
              </el-tooltip>
              <small v-if="item.screenId" class="screen-id-text">(ID: {{ item.screenId }})</small>
            </span>
          </span>
          <span class="menu__menu">
            <el-icon @click.stop="handleSetScreen(item, index)" title="屏幕设置">
              <el-icon-setting></el-icon-setting>
            </el-icon>
            <el-icon @click.stop="handleAdd(index)">
              <el-icon-plus></el-icon-plus>
            </el-icon>
            <el-icon v-if="index != 0" @click.stop="handleDel(item, index)">
              <el-icon-delete></el-icon-delete>
            </el-icon>
          </span>
        </li>
      </ul>
      <el-collapse-item title="轮播（预览模式生效）">
        <el-form-item label="开启">
          <avue-switch v-model="contain.config.groupCarousel"></avue-switch>
        </el-form-item>
        <template v-if="contain.config.groupCarousel">
          <el-form-item label="轮播时间">
            <el-input v-model="contain.config.groupTime" placeholder="3000">
              <template #append>
                <span>毫秒</span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="轮播屏幕">
            <el-dropdown>
              <el-button type="primary" style="margin: 10px 10px" icon="el-icon-plus">
                选择轮播屏幕
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <template v-for="(item, index) in groupList">
                    <el-dropdown-item v-if="index != 0" @click="addList(item)" :key="index">{{
                      item.name
                    }}</el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <draggable
              ghost-class="menu__ghost"
              class="menu__ul"
              style="width: 100%"
              :group="{ name: 'group' }"
              v-model="contain.config.groupList"
              item-key="index">
              <template #item="{ element, index }">
                <li class="menu__item" :key="index">
                  <span class="menu__icon">
                    <svg-icon icon-class="screen" />
                  </span>
                  <span class="menu__label">
                    <span class="menu__name">{{ element.name }}</span>
                  </span>
                  <span class="menu__menu">
                    <el-icon @click.stop="delList(index)">
                      <el-icon-delete></el-icon-delete>
                    </el-icon>
                  </span>
                </li>
              </template>
            </draggable>
          </el-form-item>
        </template>
      </el-collapse-item>
    </el-collapse>
  </el-form>

  <!-- 屏幕设置对话框 -->
  <el-dialog title="屏幕设置" v-model="screenSettingDialog" width="500px">
    <div v-loading="thumbnailLoading" v-bind="$loadingParams">
      <el-form label-width="100px">
        <el-form-item label="当前屏幕ID">
          <el-input v-model="tempId" placeholder="" readonly> </el-input>
        </el-form-item>
        <el-form-item label="引用大屏ID" v-if="index != 0">
          <el-input v-model="tempScreenId" placeholder="请输入大屏ID" clearable> </el-input>
        </el-form-item>
        <el-form-item label="分组ID" v-if="index != 0 && tempScreenId">
          <el-select
            v-model="tempScreenGroupId"
            placeholder="请选择分组"
            clearable
            filterable
            style="width: 100%">
            <el-option
              v-for="groupItem in tempRemoteGroupList"
              :key="groupItem.id"
              :label="groupItem.name"
              :value="groupItem.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缩略图">
          <div class="thumbnail-section">
            <div class="thumbnail-preview" v-if="tempThumbnail">
              <img :src="tempThumbnail" alt="缩略图预览" />
            </div>
            <div class="thumbnail-empty" v-else>
              <el-icon size="32"><el-icon-picture /></el-icon>
              <p>暂无缩略图</p>
            </div>
            <div class="thumbnail-actions">
              <el-upload
                class="thumbnail-upload"
                :show-file-list="false"
                :http-request="handleThumbnailUpload"
                :disabled="thumbnailLoading"
                accept="image/*">
                <el-button size="small" type="primary" :disabled="thumbnailLoading">
                  <el-icon><el-icon-upload /></el-icon>
                  上传
                </el-button>
              </el-upload>
              <el-button
                size="small"
                type="success"
                @click="handleScreenshot"
                :loading="screenshotLoading"
                :disabled="thumbnailLoading">
                <el-icon v-if="!screenshotLoading"><el-icon-camera /></el-icon>
                截图
              </el-button>
              <el-button
                v-if="tempThumbnail"
                size="small"
                type="danger"
                @click="handleDeleteThumbnail"
                :disabled="thumbnailLoading">
                <el-icon><el-icon-delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="远控元素">
          <div class="screen-elements-section">
            <div v-if="currentScreenElements.length > 0" class="elements-list">
              <div
                v-for="element in currentScreenElements"
                :key="element.index"
                class="element-item">
                <el-checkbox
                  size="small"
                  :model-value="isElementSelected(element.index)"
                  @change="handleElementChange(element, $event)">
                  <span class="element-name">{{
                    element.title || element.name || "未命名元素"
                  }}</span>
                </el-checkbox>
              </div>
            </div>
            <div v-else class="elements-empty">
              <el-icon size="24"><el-icon-box /></el-icon>
              <p>当前屏幕暂无元素</p>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="远控指令">
          <div class="custom-commands-section">
            <div class="commands-header">
              <el-button size="small" type="primary" @click="handleAddCommand">
                <el-icon><el-icon-plus /></el-icon>
                新增指令
              </el-button>
            </div>
            <div v-if="tempCustomCommands.length > 0" class="commands-list">
              <div
                v-for="(cmd, cmdIndex) in tempCustomCommands"
                :key="cmdIndex"
                class="command-item">
                <span class="command-name">{{ cmd.name }}</span>
                <span class="command-actions">
                  <el-button size="small" type="primary" link @click="handleEditCommand(cmdIndex)">
                    编辑
                  </el-button>
                  <el-button size="small" type="danger" link @click="handleDeleteCommand(cmdIndex)">
                    删除
                  </el-button>
                </span>
              </div>
            </div>
            <div v-else class="commands-empty">
              <el-icon size="24"><el-icon-collection /></el-icon>
              <p>暂无自定义指令</p>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="screenSettingDialog = false" :disabled="thumbnailLoading"
          >取消</el-button
        >
        <el-button type="primary" @click="handleConfirmScreenSetting" :disabled="thumbnailLoading"
          >确定</el-button
        >
      </span>
    </template>
  </el-dialog>

  <!-- 指令编辑对话框 -->
  <el-dialog title="编辑指令" v-model="commandDialog" width="600px" append-to-body>
    <el-form label-width="80px">
      <el-form-item label="指令名称">
        <el-input v-model="commandForm.name" placeholder="请输入指令名称" clearable />
      </el-form-item>
      <el-form-item label="执行代码">
        <div class="command-code-editor">
          <monaco-editor
            v-model="commandForm.code"
            height="200"
            show-code-btn
            language="javascript" />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="commandDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCommand">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import vuedraggable from "vuedraggable";
import { uuid } from "@/utils/utils";
import { getObj, uploadImg } from "@/api/visual";
import html2canvas from "html2canvas-pro";
import MonacoEditor from "@/page/components/monaco-editor";
export default {
  components: {
    draggable: vuedraggable,
    MonacoEditor,
  },
  inject: ["contain"],
  data() {
    return {
      obj: {},
      item: {},
      index: "",
      screenSettingDialog: false,
      currentScreen: null,
      tempId: "",
      tempScreenId: "",
      tempScreenGroupId: "",
      tempRemoteGroupList: [],
      tempThumbnail: "",
      tempSelectedElements: [],
      thumbnailLoading: false,
      screenshotLoading: false,
      groupLoading: false,
      // 自定义指令相关
      tempCustomCommands: [],
      commandDialog: false,
      commandForm: {
        name: "",
        code: "(refs)=>{\n\n}",
      },
      editingCommandIndex: -1,
    };
  },
  computed: {
    groupList() {
      return this.contain.config.group.filter(item => {
        return !this.contain.config.groupList.map(ele => ele.id).includes(item.id);
      });
    },
    currentScreenElements() {
      if (!this.currentScreen || !this.currentScreen.id) {
        return [];
      }
      // 获取当前屏幕的所有元素
      return this.contain.nav.filter(item => item.group === this.currentScreen.id) || [];
    },
  },
  watch: {
    tempScreenId: {
      async handler(val) {
        if (!val) {
          this.tempScreenGroupId = "";
          this.tempRemoteGroupList = [];
          return;
        }
        await this.fetchRemoteGroupList(val);
      },
    },
  },
  methods: {
    async handleGroupChange(item) {
      if (this.groupLoading) return;
      this.groupLoading = true;
      try {
        this.contain.group = item.id;
      } finally {
        this.groupLoading = false;
      }
    },
    addList(item) {
      this.contain.config.groupList.push(item);
    },
    delList(index) {
      this.contain.config.groupList.splice(index);
    },
    handleCopy(item) {
      this.$Clipboard({
        text: item.id,
      })
        .then(() => {
          this.$message.success("复制成功");
        })
        .catch(() => {
          this.$message.error("复制失败");
        });
    },
    handleAdd(index) {
      if (!this.contain.config.group) {
        this.contain.config.group = [];
      }
      let id = uuid();
      let item = this.contain.config.group[index] || {};
      let obj = {
        name: "新增屏幕",
        id: id,
        isname: true,
      };
      const callback = () => {
        if (!this.validatenull(index)) {
          this.contain.config.group.splice(index + 1, 0, obj);
        } else {
          this.contain.config.group.push(obj);
        }
      };
      if (!index) {
        callback();
        return;
      }
      this.$confirm("是否复制当前内容?", "提示", {
        confirmButtonText: "复制",
        cancelButtonText: "不复制",
        type: "warning",
      })
        .then(() => {
          let list = this.deepClone(this.contain.nav).filter(ele => ele.group == item.id);
          const findEle = result => {
            result.forEach(ele => {
              ele.index = uuid();
              ele.group = id;
              if (ele.children) findEle(ele.children);
            });
          };
          findEle(list);
          this.contain.nav = this.contain.nav.concat(list);
          callback();
        })
        .catch(() => {});
    },
    handleDel(item, index) {
      this.$confirm(`是否删除【${item.name}】屏幕?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        for (let i = 0; i < this.contain.nav.length; i++) {
          const ele = this.contain.nav[i],
            index = i;
          if (ele.group == this.contain.group) {
            this.contain.nav.splice(index, 1);
            i--;
          }
        }
        this.contain.config.group.splice(index, 1);
        if (this.contain.group == item.id) {
          this.contain.group = index != 0 ? this.contain.config.group[index - 1].id : "";
        }
      });
    },
    handleSetScreen(item, index) {
      this.index = index;
      this.currentScreen = item;
      this.tempId = item.id;
      this.tempRemoteGroupList = [];
      this.tempScreenId = item.screenId || "";
      this.tempScreenGroupId = item.screenGroupId || "";
      this.tempThumbnail = item.thumbnail || "";
      this.tempSelectedElements = item.selectedElements || [];
      this.tempCustomCommands = item.customCommands ? [...item.customCommands] : [];
      this.screenSettingDialog = true;
      if (this.tempScreenId) {
        this.fetchRemoteGroupList(this.tempScreenId);
      }
    },
    async fetchRemoteGroupList(screenId) {
      try {
        const res = await getObj(screenId);
        const detailStr = res.data?.data?.config?.detail;
        const detail = detailStr ? JSON.parse(detailStr) : {};
        const groupList = Array.isArray(detail.group) ? detail.group : [];
        this.tempRemoteGroupList = groupList;
        if (
          this.tempScreenGroupId &&
          !groupList.some(item => String(item.id) === String(this.tempScreenGroupId))
        ) {
          this.tempScreenGroupId = "";
        }
      } catch (error) {
        console.error("获取引用分组失败:", error);
        this.tempRemoteGroupList = [];
        this.tempScreenGroupId = "";
      }
    },
    async handleConfirmScreenSetting() {
      if (this.currentScreen) {
        this.currentScreen.screenId = this.tempScreenId || "";
        this.currentScreen.screenGroupId = this.tempScreenId ? this.tempScreenGroupId || "" : "";
        this.currentScreen.thumbnail = this.tempThumbnail || "";
        this.currentScreen.selectedElements = this.tempSelectedElements || [];
        this.currentScreen.customCommands = [...this.tempCustomCommands];
        this.screenSettingDialog = false;

        if (this.tempScreenId) {
          try {
            await this.handleLoadScreen(this.currentScreen);
            this.$message.success("设置成功");
          } catch (error) {
            console.error("加载大屏配置失败:", error);
            this.$message.error(error?.message || "加载大屏配置失败");
          }
        } else {
          delete this.contain.screenComponents[this.currentScreen.id];
          this.currentScreen.screenGroupId = "";
          this.$message.success("设置成功");
        }
      }
    },
    async handleLoadScreen(item) {
      if (!item.screenId) {
        this.$message.warning("请先设置屏幕ID");
        return;
      }

      return this.contain.handleLoadScreen(item);
    },
    // 缩略图相关方法
    handleThumbnailClick(item) {
      if (item.thumbnail) {
        this.$ImagePreview([{ url: item.thumbnail }], 0, {});
      }
    },
    async handleThumbnailUpload(config) {
      const { file } = config;
      this.thumbnailLoading = true;
      try {
        const formdata = new FormData();
        formdata.append("file", file);
        const res = await uploadImg(formdata);
        const url = res.data.data.link;
        this.tempThumbnail = url;
        this.$message.success("上传成功");
      } catch (error) {
        console.error("上传失败:", error);
        this.$message.error("上传失败");
      } finally {
        this.thumbnailLoading = false;
      }
    },
    async handleScreenshot() {
      this.screenshotLoading = true;
      this.thumbnailLoading = true;
      try {
        const canvas = await html2canvas(document.querySelector(".canvas"), {
          useCORS: true,
          backgroundColor: null,
          logging: false,
          allowTaint: true,
        });
        // 将 canvas 转换为 blob
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, "image/png");
        });
        // 创建 File 对象
        const file = new File([blob], `screenshot_${Date.now()}.png`, { type: "image/png" });
        // 上传截图
        const formdata = new FormData();
        formdata.append("file", file);
        const res = await uploadImg(formdata);
        const url = res.data.data.link;
        this.tempThumbnail = url;
        this.$message.success("截图上传成功");
      } catch (error) {
        console.error("截图失败:", error);
        this.$message.error("截图失败");
      } finally {
        this.screenshotLoading = false;
        this.thumbnailLoading = false;
      }
    },
    handleDeleteThumbnail() {
      this.tempThumbnail = "";
      this.$message.success("缩略图已删除");
    },
    isElementSelected(index) {
      return this.tempSelectedElements.some(item => item.index === index);
    },
    handleElementChange(element, checked) {
      if (checked) {
        // 添加元素，存储name和index
        this.tempSelectedElements.push({
          name: element.title || element.name || "未命名元素",
          index: element.index,
        });
      } else {
        // 移除元素
        const idx = this.tempSelectedElements.findIndex(item => item.index === element.index);
        if (idx > -1) {
          this.tempSelectedElements.splice(idx, 1);
        }
      }
    },
    // 自定义指令相关方法
    handleAddCommand() {
      this.editingCommandIndex = -1;
      this.commandForm = {
        name: "",
        code: "(refs)=>{\n\n}",
      };
      this.commandDialog = true;
    },
    handleEditCommand(index) {
      this.editingCommandIndex = index;
      const cmd = this.tempCustomCommands[index];
      this.commandForm = {
        name: cmd.name,
        code: cmd.code,
      };
      this.commandDialog = true;
    },
    handleDeleteCommand(index) {
      this.$confirm("确定删除该指令吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.tempCustomCommands.splice(index, 1);
        this.$message.success("删除成功");
      });
    },
    handleSaveCommand() {
      if (!this.commandForm.name) {
        this.$message.warning("请输入指令名称");
        return;
      }
      if (!this.commandForm.code) {
        this.$message.warning("请输入执行代码");
        return;
      }
      const cmd = {
        name: this.commandForm.name,
        code: this.commandForm.code,
      };
      if (this.editingCommandIndex === -1) {
        // 新增
        this.tempCustomCommands.push(cmd);
      } else {
        // 编辑
        this.tempCustomCommands[this.editingCommandIndex] = cmd;
      }
      this.commandDialog = false;
      this.$message.success("保存成功");
    },
  },
};
</script>

<style scoped>
.menu__item.has-screen-id {
  background-color: var(--primary-lighter-color);
}

.screen-id-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: bold;
}

.menu__icon {
  position: relative;
  cursor: pointer;
}

.menu__thumbnail {
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border-color-base);
}

.screen-id-text {
  color: var(--primary-color);
  font-size: 12px;
  margin-left: 5px;
  font-weight: normal;
}

.menu__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.thumbnail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.thumbnail-preview {
  width: 100%;
  max-height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color-light);
}

.thumbnail-preview img {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
}

.thumbnail-empty {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  color: var(--text-color-placeholder);
  border: 1px dashed var(--border-color-base);
}

.thumbnail-empty p {
  margin-top: 8px;
  font-size: 12px;
}

.thumbnail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.thumbnail-upload {
  display: inline-block;
}

.screen-elements-section {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-color-light);
  border-radius: 4px;
  padding: 10px;
  background-color: var(--bg-color-secondary);
}

.elements-list {
  width: 100%;
}

.element-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color-lighter);
}

.element-item:last-child {
  border-bottom: none;
}

.element-name {
  font-weight: 500;
  margin-right: 8px;
}

.element-type {
  font-size: 12px;
  color: var(--text-color-secondary);
  padding: 2px 8px;
  background-color: var(--bg-color);
  border-radius: 4px;
}

.elements-empty {
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-color-placeholder);
}

.elements-empty p {
  margin-top: 8px;
  font-size: 12px;
}

/* 自定义指令样式 */
.custom-commands-section {
  width: 100%;
  border: 1px solid var(--border-color-light);
  border-radius: 4px;
  padding: 10px;
  background-color: var(--bg-color-secondary);
}

.commands-header {
  margin-bottom: 10px;
}

.commands-list {
  width: 100%;
}

.command-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border-color-lighter);
  background-color: var(--bg-color);
  border-radius: 4px;
  margin-bottom: 4px;
}

.command-item:last-child {
  margin-bottom: 0;
}

.command-name {
  font-weight: 500;
  color: var(--text-color);
}

.command-actions {
  display: flex;
  gap: 4px;
}

.commands-empty {
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-color-placeholder);
}

.commands-empty p {
  margin-top: 8px;
  font-size: 12px;
}

.command-code-editor {
  width: 100%;
  border: 1px solid var(--border-color-light);
  border-radius: 4px;
  overflow: hidden;
}
</style>
