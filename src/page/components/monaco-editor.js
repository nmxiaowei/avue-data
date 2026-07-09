/* eslint-disable */
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
// 导入搜索模块和格式化相关模块

// 导入格式化模块
import "monaco-editor/esm/vs/editor/contrib/find/browser/findController";
import "monaco-editor/esm/vs/editor/contrib/format/browser/formatActions";
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding"; // 添加代码折叠模块
// 添加其他格式化相关模块
import "monaco-editor/esm/vs/editor/contrib/format/browser/format";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess"; // 命令支持
// 导入注释相关模块
import "monaco-editor/esm/vs/editor/contrib/comment/browser/comment";
// 导入括号匹配高亮模块
import "monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching";
// 错误标记使用内置的 markers API，不需要额外导入模块
import { defineAsyncComponent } from "vue";
import { getCurrentTheme, onThemeChange, THEME_TYPES } from "@/utils/theme";
import { fullScreen } from "@/utils/utils";
// 懒加载导入代码库组件
const CodeBtn = defineAsyncComponent(() => import("@/page/components/CodeBtn.vue"));
// 导入样式文件
import "./monaco-editor.scss";

const MONACO_THEME_MAP = {
  [THEME_TYPES.DARK]: "vs-dark",
  [THEME_TYPES.LIGHT]: "vs",
  [THEME_TYPES.CYBERPUNK]: "vs-dark",
  dark: "vs-dark",
  light: "vs",
  "vs-dark": "vs-dark",
  vs: "vs",
  "hc-black": "hc-black",
  "hc-light": "hc-light",
};

function beautifier(value) {
  return JSON.stringify(value, null, 4);
}
function noop() {}

// 注册格式化提供程序
monaco.languages.registerDocumentFormattingEditProvider("javascript", {
  provideDocumentFormattingEdits: function (model) {
    // 简单的JS格式化
    try {
      const text = model.getValue();
      // 对JavaScript进行简单的缩进处理
      // 注意：这不是真正的JS格式化，仅做基本处理
      // 实际项目中可以使用js-beautify等库

      // 这里只做简单的空格缩进
      const lines = text.split("\n");
      let indentLevel = 0;
      const formattedLines = lines.map(line => {
        let trimmedLine = line.trim();
        if (!trimmedLine) return "";

        // 减少缩进的情况
        if (
          trimmedLine.startsWith("}") ||
          trimmedLine.startsWith(")") ||
          trimmedLine.startsWith("]")
        ) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // 创建当前缩进
        const indent = "  ".repeat(indentLevel);

        // 增加缩进的情况
        if (
          trimmedLine.endsWith("{") ||
          trimmedLine.endsWith("(") ||
          trimmedLine.endsWith("[") ||
          trimmedLine.endsWith("=>") ||
          trimmedLine.endsWith(":")
        ) {
          indentLevel++;
        }

        return indent + trimmedLine;
      });

      return [
        {
          range: model.getFullModelRange(),
          text: formattedLines.join("\n"),
        },
      ];
    } catch (e) {
      console.error("JS格式化失败:", e);
      return [];
    }
  },
});

// 为其他语言注册格式化提供程序
monaco.languages.registerDocumentFormattingEditProvider("json", {
  provideDocumentFormattingEdits: function (model) {
    try {
      const text = model.getValue();
      const formatted = JSON.stringify(JSON.parse(text), null, 2);
      return [
        {
          range: model.getFullModelRange(),
          text: formatted,
        },
      ];
    } catch (e) {
      console.error("JSON格式化失败:", e);
      return [];
    }
  },
});

export { monaco };

export default {
  name: "MonacoEditor",
  components: {
    CodeBtn, // 注册代码库组件
  },
  template: `<div class="monaco_editor_container" :style="style">
    <div class="monaco-toolbar" v-if="showToolbar && disabled!=true">
      <!-- 编辑操作下拉 -->
      <el-dropdown trigger="click" @command="handleEditCommand" size="small">
        <button type="button" class="toolbar-btn">
          <el-icon><el-icon-edit /></el-icon> 编辑 <el-icon style="font-size:12px;margin-left:2px;"><el-icon-arrow-down /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="format"><el-icon><el-icon-sort /></el-icon> 格式化代码</el-dropdown-item>
            <el-dropdown-item command="search"><el-icon><el-icon-search /></el-icon> 搜索替换</el-dropdown-item>
            <el-dropdown-item command="fold" :divided="true"><el-icon><component :is="isFolded ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" /></el-icon> {{ isFolded ? '展开代码' : '折叠代码' }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 文件操作下拉 -->
      <el-dropdown trigger="click" @command="handleFileCommand" size="small">
        <button type="button" class="toolbar-btn">
          <el-icon><el-icon-document /></el-icon> 文件 <el-icon style="font-size:12px;margin-left:2px;"><el-icon-arrow-down /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="import"><el-icon><el-icon-upload /></el-icon> 导入Txt文件</el-dropdown-item>
            <el-dropdown-item command="importExcel"><el-icon><el-icon-upload /></el-icon> 导入 Excel</el-dropdown-item>
            <el-dropdown-item command="export"><el-icon><el-icon-download /></el-icon> 导出文件</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 全屏按钮 -->
      <button v-if="fullScreen" type="button" @click="handleFullScreen" class="toolbar-btn" :title="isMaximum ? '退出全屏' : '全屏显示'">
        <el-icon><component :is="isMaximum ? 'el-icon-close' : 'el-icon-full-screen'" /></el-icon> {{ isMaximum ? '退出' : '全屏' }}
      </button>
      <code-btn v-if="showCodeBtn" :get-code="getCode" :type="codeType" @import="handleCodeLibImport" />
     <input type="file" ref="fileInput" @change="onFileSelected" style="display: none;" />
     <input type="file" ref="excelInput" @change="onExcelSelected" accept=".xls,.xlsx" style="display: none;" />
    </div>
  </div>
  `,
  props: {
    fullScreen: { type: Boolean, default: true },
    diffEditor: { type: Boolean, default: false }, //是否使用diff模式
    width: { type: [String, Number], default: "100%" },
    height: { type: [String, Number], default: "400px" },
    original: String, //只有在diff模式下有效
    modelValue: [String, Object, Array],
    language: { type: String, default: "javascript" },
    theme: { type: String, default: "auto" },
    disabled: { type: Boolean, default: false },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    editorMounted: { type: Function, default: noop },
    editorBeforeMount: { type: Function, default: noop },
    showToolbar: { type: Boolean, default: true }, //是否显示工具栏
    showCodeBtn: { type: Boolean, default: true }, //是否显示代码库功能
    codeType: { type: String, default: "" }, //代码说明类型
  },
  data() {
    return {
      isFormatting: false, // 是否正在执行格式化操作
      isMaximum: false, // 是否处于全屏状态
      originSize: {
        // 原始尺寸
        width: 0,
        height: 0,
      },
      isFolded: false, // 是否折叠代码
      currentFileName: "code.js", // 导出文件的默认名称
      _diffModels: [],
      _errorTooltipButton: null,
      _errorTooltipEl: null,
      _errorTooltipMouseEnterHandler: null,
    };
  },
  watch: {
    options: {
      deep: true,
      handler(options) {
        this.editor && this.editor.updateOptions(options);
      },
    },
    language() {
      if (!this.editor) return;
      if (this.diffEditor) {
        //diff模式下更新language
        const { original, modified } = this.editor.getModel();
        monaco.editor.setModelLanguage(original, this.language);
        monaco.editor.setModelLanguage(modified, this.language);
      } else monaco.editor.setModelLanguage(this.editor.getModel(), this.language);
    },

    theme() {
      this.applyEditorTheme(this.theme);
    },

    style() {
      this.editor &&
        this.$nextTick(() => {
          this.editor.layout();
        });
    },

    modelValue: {
      handler(val) {
        if (this.editor && val !== this._getValue()) {
          this._setValue(val);
        }
      },
      deep: true,
    },
  },

  computed: {
    style() {
      return {
        width: !/^\d+$/.test(this.width) ? this.width : `${this.width}px`,
        height: !/^\d+$/.test(this.height) ? this.height : `${this.height}px`,
        position: "relative",
      };
    },
  },

  mounted() {
    this._themeUnsubscribe = onThemeChange(() => {
      if (this.isAutoTheme()) {
        this.applyEditorTheme();
      }
    });
    this.initMonaco();
  },

  beforeUnmount() {
    // 移除窗口调整事件监听
    if (this._boundHandleResize) {
      window.removeEventListener("resize", this._boundHandleResize);
    }

    // 移除ESC键事件监听
    if (this._escKeyHandler) {
      document.removeEventListener("keyup", this._escKeyHandler);
      this._escKeyHandler = null;
    }

    // 销毁编辑器
    if (this._themeUnsubscribe) {
      this._themeUnsubscribe();
      this._themeUnsubscribe = null;
    }
    clearTimeout(this._tooltipHideTimer);
    this.removeErrorTooltipListeners();
    this.editor && this.editor.dispose();
    this.editor = null;
    this.disposeDiffModels();
  },

  methods: {
    isAutoTheme(theme = this.theme) {
      return !theme || theme === "auto";
    },
    resolveMonacoTheme(theme = this.theme) {
      if (this.isAutoTheme(theme)) {
        return MONACO_THEME_MAP[getCurrentTheme()] || "vs-dark";
      }
      return MONACO_THEME_MAP[theme] || theme || "vs-dark";
    },
    applyEditorTheme(theme = this.theme) {
      if (!this.editor) return;
      monaco.editor.setTheme(this.resolveMonacoTheme(theme));
    },
    /**
     * 处理编辑操作下拉命令
     */
    handleEditCommand(command) {
      switch (command) {
        case "format":
          this.formatCode();
          break;
        case "search":
          this.toggleSearch();
          break;
        case "fold":
          this.toggleCodeFolding();
          break;
      }
    },
    /**
     * 处理文件操作下拉命令
     */
    handleFileCommand(command) {
      switch (command) {
        case "import":
          this.importFile();
          break;
        case "importExcel":
          this.importExcel();
          break;
        case "export":
          this.exportFile();
          break;
      }
    },
    /**
     * 切换全屏显示
     * @param {Event} event - 点击事件对象
     */
    handleFullScreen(event) {
      // 阻止事件冒泡和默认行为
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // 使用工具函数进行全屏切换
      fullScreen(this.$el);

      // 切换全屏状态
      this.isMaximum = !this.isMaximum;

      // 或者使用自定义的全屏逻辑
      // this._handleFullScreen();
    },

    /**
     * 初始化Monaco编辑器
     */
    initMonaco() {
      const { modelValue, language, theme, disabled, options } = this;
      const value = modelValue;
      const monacoTheme = this.resolveMonacoTheme(theme);
      Object.assign(options, this._editorBeforeMount()); //编辑器初始化前

      // 创建编辑器容器元素
      const editorContainer = document.createElement("div");
      editorContainer.style.height = this.showToolbar ? "calc(100% - 34px)" : "100%";
      editorContainer.style.width = "100%";
      editorContainer.className = "monaco-editor-container";
      this.$el.appendChild(editorContainer);
      this.editor = monaco.editor[this.diffEditor ? "createDiffEditor" : "create"](
        editorContainer,
        {
          value: typeof value == "string" ? value : beautifier(value),
          language: language,
          theme: monacoTheme,
          readOnly: disabled,
          overviewRulerBorder: false, // 滚动是否有边框
          minimap: {
            enabled: false,
          },
          scrollbar: {
            verticalScrollbarSize: 6, // 垂直滚动条宽度，默认px
            horizontalScrollbarSize: 6, // 水平滚动条高度
          },
          fontSize: 15,
          fullScreen: true,
          automaticLayout: true, // 自动布局
          foldingStrategy: "indentation", // 代码可分小段折叠
          autoClosingBrackets: "always",
          folding: true, // 启用代码折叠
          showFoldingControls: "always", // 始终显示折叠控件
          formatOnPaste: true, // 粘贴时自动格式化
          formatOnType: true, // 输入时自动格式化
          matchBrackets: "always", // 启用括号匹配高亮
          ...options,
        },
      );
      this.diffEditor && this._setModel(this.modelValue, this.original);
      this._editorMounted(this.editor); //编辑器初始化后

      // 绑定_handleResize到当前组件实例
      this._boundHandleResize = this._handleResize.bind(this);
      // 监听窗口调整事件，更新编辑器布局
      window.addEventListener("resize", this._boundHandleResize);
    },

    /**
     * 打开代码搜索框
     * @param {Event} event - 点击事件对象
     */
    toggleSearch(event) {
      // 阻止事件冒泡和默认行为
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const editor = this._getEditor();
      if (!editor) return;

      // 触发搜索命令
      editor.getAction("actions.find").run();
    },

    /**
     * 格式化编辑器中的代码
     * @param {Event} event - 点击事件对象
     */
    formatCode(event) {
      // 阻止事件冒泡和默认行为
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // 防止重复格式化
      if (this.isFormatting) return;

      const editor = this._getEditor();
      if (!editor) return;

      this.isFormatting = true;

      try {
        // 方法1：使用editor.trigger
        editor.trigger("formatter", "editor.action.formatDocument");
      } catch (error) {
        console.error("格式化出错:", error);
        this.isFormatting = false;
      }
    },

    /**
     * 切换代码折叠/展开状态
     * @param {Event} event - 点击事件对象
     */
    toggleCodeFolding(event) {
      // 阻止事件冒泡和默认行为
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const editor = this._getEditor();
      if (!editor) return;

      if (this.isFolded) {
        // 当前已折叠，需要展开
        editor.getAction("editor.unfoldAll")?.run();
        this.isFolded = false;
      } else {
        // 当前未折叠，需要折叠
        editor.getAction("editor.foldAll")?.run();
        this.isFolded = true;
      }
    },

    _handleFullScreen() {
      if (this.isMaximum) this.minEditor();
      else this.maxEditor();
    },
    // 放大
    maxEditor() {
      this.isMaximum = true;
      let dom = this.$el;
      this.originSize = {
        width: dom.clientWidth,
        height: dom.clientHeight,
      };
      dom.classList.add("editor-fullscreen");

      // 获取编辑器容器元素
      const editorContainer = dom.querySelector("div:not(.monaco-toolbar)");

      // 重新调整编辑器大小
      this.editor.layout({
        height: document.body.clientHeight - (this.showToolbar ? 34 : 0),
        width: document.body.clientWidth,
      });

      // ESC键退出全屏事件处理
      if (this._escKeyHandler) {
        document.removeEventListener("keyup", this._escKeyHandler);
      }
      this._escKeyHandler = e => {
        if (e.keyCode == 27) {
          this.minEditor();
        }
      };

      document.addEventListener("keyup", this._escKeyHandler);
    },
    // 缩小
    minEditor() {
      this.isMaximum = false;
      let dom = this.$el;
      dom.classList.remove("editor-fullscreen");

      // 获取编辑器容器元素
      const editorContainer = dom.querySelector("div:not(.monaco-toolbar)");

      // 重新调整编辑器大小
      this.editor.layout({
        height: this.originSize.height - (this.showToolbar ? 34 : 0),
        width: this.originSize.width,
      });

      // 移除ESC键事件监听
      if (this._escKeyHandler) {
        document.removeEventListener("keyup", this._escKeyHandler);
        this._escKeyHandler = null;
      }
    },

    /**
     * 获取当前编辑器实例
     * @returns {Object|null} 编辑器实例
     */
    _getEditor() {
      if (!this.editor) return null;
      return this.diffEditor ? this.editor.modifiedEditor : this.editor;
    },

    _setModel(value, original) {
      //diff模式下设置model
      const { language } = this;
      this.disposeDiffModels();
      const originalModel = monaco.editor.createModel(original, language);
      const modifiedModel = monaco.editor.createModel(value, language);
      this._diffModels = [originalModel, modifiedModel];
      this.editor.setModel({
        original: originalModel,
        modified: modifiedModel,
      });
    },

    disposeDiffModels() {
      this._diffModels.forEach(model => model && model.dispose && model.dispose());
      this._diffModels = [];
    },

    _setValue(value) {
      let editor = this._getEditor();
      if (typeof value == "object") {
        value = beautifier(value);
      }
      if (editor) return editor.setValue(value || "");
    },

    _getValue() {
      let editor = this._getEditor();
      if (!editor) return "";
      return editor.getValue();
    },

    _editorBeforeMount() {
      const options = this.editorBeforeMount(monaco);
      return options || {};
    },

    _editorMounted(editor) {
      this.editorMounted(editor, monaco);
      if (this.diffEditor) {
        editor.onDidUpdateDiff(event => {
          const value = this._getValue();
          this._emitChange(value, event);
        });
      } else {
        editor.onDidChangeModelContent(event => {
          const value = this._getValue();
          this._emitChange(value, event);
        });
      }
    },

    _emitChange(value, event) {
      this.$emit("change", value, event);
      this.$emit("update:modelValue", value);
    },

    /**
     * 处理窗口大小变化，重新布局编辑器
     */
    _handleResize() {
      if (this.editor) {
        this.editor.layout();
      }
    },

    /**
     * 导入文件到编辑器
     * @param {Event} event - 点击事件对象
     */
    importFile(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // 触发文件选择对话框
      this.$refs.fileInput.click();
    },

    /**
     * 处理选择的文件并导入内容到编辑器
     * @param {Event} event - 文件选择事件
     */
    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 保存文件名以便导出时使用
      this.currentFileName = file.name;

      // 根据文件扩展名判断语言类型
      const fileExt = file.name.split(".").pop().toLowerCase();
      const langMap = {
        js: "javascript",
        json: "json",
        html: "html",
        htm: "html",
        css: "css",
        ts: "typescript",
        txt: "plaintext",
      };

      // 如果能识别文件类型，设置编辑器语言
      if (langMap[fileExt]) {
        // 通过组件接口更新语言
        this.language = langMap[fileExt];
      }

      // 读取文件内容
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target.result;
        this._setValue(content);
        // 通知父组件内容变化
        this._emitChange(content, {});
      };
      reader.readAsText(file);

      // 重置文件输入，以便能够再次选择同一文件
      event.target.value = "";
    },

    /**
     * 导出编辑器内容到文件
     * @param {Event} event - 点击事件对象
     */
    exportFile(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const content = this._getValue();
      if (!content) {
        return;
      }

      // 创建Blob对象
      const blob = new Blob([content], { type: "text/plain" });

      // 创建下载链接
      const a = document.createElement("a");
      a.download = this.currentFileName;
      a.href = URL.createObjectURL(blob);
      a.style.display = "none";

      // 添加到DOM，触发点击，然后移除
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 释放URL对象
      URL.revokeObjectURL(a.href);
    },

    /**
     * 导入 Excel 文件
     * @param {Event} event - 点击事件对象
     */
    importExcel(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // 触发 Excel 文件选择对话框
      this.$refs.excelInput.click();
    },

    /**
     * 处理选择的 Excel 文件并导入内容到编辑器
     * @param {Event} event - 文件选择事件
     */
    onExcelSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 检查是否有 $Export 工具
      if (!this.$Export || !this.$Export.xlsx) {
        console.error("Excel 导入功能需要 $Export.xlsx 工具");
        return;
      }

      // 使用 $Export.xlsx 解析 Excel 文件
      this.$Export
        .xlsx(file)
        .then(data => {
          // 将解析后的数据转换为 JSON 字符串
          const jsonData = JSON.stringify(data.results, null, 2);

          // 设置编辑器内容
          this._setValue(jsonData);

          // 通知父组件内容变化
          this._emitChange(jsonData, {});

          // 如果编辑器语言不是 JSON,切换为 JSON
          if (this.language !== "json" && this.language !== "javascript") {
            this.language = "json";
          }
        })
        .catch(error => {
          console.error("Excel 导入失败:", error);
        });

      // 重置文件输入,以便能够再次选择同一文件
      event.target.value = "";
    },

    /**
     * 处理从代码库导入的代码
     * @param {string} code - 导入的代码内容
     */
    handleCodeLibImport(code) {
      this._setValue(code);
      this._emitChange(code, {});
    },

    /**
     * 获取当前编辑器代码（公开方法，用于传递给子组件）
     * @returns {string} 当前代码内容
     */
    getCode() {
      return this._getValue();
    },

    /**
     * 清除所有错误标记
     */
    clearErrorMarkers() {
      const model = this._getEditor().getModel();
      monaco.editor.setModelMarkers(model, "codeCheck", []);
      this.errors = [];
      this.errorCount = 0;
      this.hasErrors = false;
    },

    /**
     * 检查JavaScript代码中的错误
     * @param {string} code - 代码内容
     * @param {Object} model - 编辑器模型
     */
    checkJavaScriptErrors(code, model) {
      try {
        // 尝试预处理代码，处理函数参数等特殊情况
        const processedCode = this.preprocessJSCode(code);
        // 简单的语法错误检查

        new Function(processedCode);

        // 检查其他常见问题
        const markers = [];

        // 检查未闭合的括号
        this.checkBracketBalance(code, markers);

        // 检查可能的未定义变量 (简易版)
        this.checkUndefinedVariables(code, markers, this.extractFunctionParameters(code));

        // 设置标记
        monaco.editor.setModelMarkers(model, "codeCheck", markers);

        // 保存错误信息
        this.errors = markers;
        this.errorCount = markers.length;
        this.hasErrors = markers.length > 0;
      } catch (error) {
        // 捕获语法错误
        const lineMatch = error.stack && error.stack.match(/<anonymous>:(\d+):(\d+)/);
        let lineNumber = 1;
        let column = 1;

        if (lineMatch && lineMatch.length >= 3) {
          lineNumber = parseInt(lineMatch[1]);
          column = parseInt(lineMatch[2]);
        }

        const markers = [
          {
            severity: monaco.MarkerSeverity.Error,
            message: `语法错误: ${error.message}`,
            startLineNumber: lineNumber,
            startColumn: column,
            endLineNumber: lineNumber,
            endColumn: column + 1,
          },
        ];

        monaco.editor.setModelMarkers(model, "codeCheck", markers);

        // 保存错误信息
        this.errors = markers;
        this.errorCount = markers.length;
        this.hasErrors = true;
      }
    },

    /**
     * 预处理JavaScript代码，处理特殊情况
     * @param {string} code - 原始代码
     * @returns {string} - 处理后的代码
     */
    preprocessJSCode(code) {
      // 检测是否为箭头函数或普通函数定义
      const functionPattern = /^\s*(\([\w\s,=]*\)|[\w\s,]+)\s*=>\s*{/;
      const regularFunctionPattern = /^\s*function\s*[\w$]*\s*\(([\w\s,=]*)\)\s*{/;

      if (functionPattern.test(code)) {
        // 如果是箭头函数，直接将其包装在函数表达式中
        return `(function() { return ${code}\n })()`;
      } else if (regularFunctionPattern.test(code)) {
        // 如果是常规函数，包装它
        return `(${code}\n )()`;
      }

      return code;
    },

    /**
     * 提取函数参数名称
     * @param {string} code - 代码内容
     * @returns {Set} - 参数名称集合
     */
    extractFunctionParameters(code) {
      const params = new Set();

      // 匹配函数参数
      const arrowFunctionParams = /^\s*\(?([^()]*)\)?\s*=>/;
      const functionParams = /function\s*[\w$]*\s*\(([^()]*)\)/;

      // 提取箭头函数参数
      const arrowMatch = code.match(arrowFunctionParams);
      if (arrowMatch && arrowMatch[1]) {
        arrowMatch[1].split(",").forEach(param => {
          const cleanParam = param.trim().split("=")[0].trim();
          if (cleanParam) params.add(cleanParam);
        });
      }

      // 提取普通函数参数
      const funcMatch = code.match(functionParams);
      if (funcMatch && funcMatch[1]) {
        funcMatch[1].split(",").forEach(param => {
          const cleanParam = param.trim().split("=")[0].trim();
          if (cleanParam) params.add(cleanParam);
        });
      }

      return params;
    },

    /**
     * 检查JSON代码中的错误
     * @param {string} code - 代码内容
     * @param {Object} model - 编辑器模型
     */
    checkJsonErrors(code, model) {
      try {
        // 跳过空内容的检查
        if (!code.trim()) {
          monaco.editor.setModelMarkers(model, "codeCheck", []);
          this.errors = [];
          this.errorCount = 0;
          this.hasErrors = false;
          return;
        }

        // 先处理常见的输入清理
        const trimmedCode = code.trim();

        // 首先尝试直接解析标准JSON
        try {
          JSON.parse(trimmedCode);
          // 如果能解析，说明是有效的JSON
          monaco.editor.setModelMarkers(model, "codeCheck", []);
          this.errors = [];
          this.errorCount = 0;
          this.hasErrors = false;
          return;
        } catch (jsonError) {
          // 不是有效的JSON，继续检查
        }

        // 如果是JS对象字面量，尝试转换和解析
        if (this.isValidJsObject(trimmedCode)) {
          monaco.editor.setModelMarkers(model, "codeCheck", []);
          this.errors = [];
          this.errorCount = 0;
          this.hasErrors = false;
          return;
        }

        // 不是有效的JSON也不是有效的JS对象，标记错误
        const errorInfo = this.findJsonErrorPosition(trimmedCode);

        const markers = [
          {
            severity: monaco.MarkerSeverity.Error,
            message: errorInfo.message,
            startLineNumber: errorInfo.line,
            startColumn: errorInfo.column,
            endLineNumber: errorInfo.line,
            endColumn: errorInfo.column + 1,
          },
        ];

        monaco.editor.setModelMarkers(model, "codeCheck", markers);

        // 保存错误信息
        this.errors = markers;
        this.errorCount = markers.length;
        this.hasErrors = true;
      } catch (error) {
        console.error("检查JSON错误出错:", error);
      }
    },

    /**
     * 检查是否是有效的JavaScript对象字面量
     * @param {string} code - 代码内容
     * @returns {boolean} - 是否是有效的JS对象
     */
    isValidJsObject(code) {
      try {
        // 1. 检查是否是以花括号开始和结束
        const trimmedCode = code.trim();
        if (!trimmedCode.startsWith("{") || !trimmedCode.endsWith("}")) {
          return false;
        }

        // 2. 尝试使用Function评估对象
        try {
          new Function(`return ${trimmedCode}`);
          return true;
        } catch (e) {
          // Function评估失败，继续尝试其他方法
        }

        // 3. 检查键值对格式并尝试转换
        // 替换所有可能的有效JavaScript对象属性名格式为标准JSON格式
        const convertedCode = trimmedCode
          // 替换单引号为双引号 (考虑转义字符)
          .replace(/'((?:\\.|[^'\\])*?)'/g, '"$1"')
          // 替换不带引号的属性名为带双引号的格式
          .replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');

        // 尝试作为JSON解析转换后的代码
        JSON.parse(convertedCode);
        return true;
      } catch (e) {
        return false;
      }
    },

    /**
     * 查找JSON错误的位置
     * @param {string} code - JSON代码
     * @returns {Object} - 错误位置信息
     */
    findJsonErrorPosition(code) {
      let line = 1;
      let column = 1;
      let message = "JSON语法错误";

      try {
        JSON.parse(code);
        // 不应该到达这里
        return { line, column, message };
      } catch (e) {
        const errorMatch = e.message.match(/at position (\d+)/);
        const lineMatch = e.message.match(/at line (\d+) column (\d+)/);

        if (lineMatch && lineMatch.length >= 3) {
          // 有些JSON解析器直接提供行列信息
          line = parseInt(lineMatch[1]);
          column = parseInt(lineMatch[2]);
          message = `JSON解析错误: ${e.message}`;
        } else if (errorMatch && errorMatch.length >= 2) {
          // 根据position计算行列
          const position = parseInt(errorMatch[1]);
          const lines = code.slice(0, position).split("\n");
          line = lines.length;
          column = lines[lines.length - 1].length + 1;
          message = `JSON解析错误: ${e.message}`;
        } else {
          // 找不到位置信息，尝试手动分析
          try {
            // 使用我们自己的检测逻辑查找常见问题
            const result = this.analyzeJsonSyntaxError(code);
            line = result.line;
            column = result.column;
            message = result.message;
          } catch (analyzeError) {
            // 如果分析也失败，使用默认值
            message = `JSON解析错误: ${e.message}`;
          }
        }

        return { line, column, message };
      }
    },

    /**
     * 分析JSON语法错误
     * @param {string} code - JSON代码
     * @returns {Object} - 错误信息
     */
    analyzeJsonSyntaxError(code) {
      const lines = code.split("\n");

      // 检查常见问题

      // 1. 检查键没有使用双引号
      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        const unquotedKeyMatch = lineContent.match(/[{,]\s*([a-zA-Z0-9_$]+)\s*:/);
        if (unquotedKeyMatch) {
          const keyPosition = lineContent.indexOf(unquotedKeyMatch[1]);
          return {
            line: i + 1,
            column: keyPosition + 1,
            message: `JSON 中的键必须使用双引号: "${unquotedKeyMatch[1]}"`,
          };
        }
      }

      // 2. 检查使用了单引号
      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        const singleQuoteMatch = lineContent.match(/'[^']*'/);
        if (singleQuoteMatch) {
          const quotePosition = lineContent.indexOf(singleQuoteMatch[0]);
          return {
            line: i + 1,
            column: quotePosition + 1,
            message: "JSON 中不允许使用单引号，请使用双引号",
          };
        }
      }

      // 3. 检查尾随逗号
      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        const trailingCommaMatch = lineContent.match(/,\s*[}\]]|,\s*$/);
        if (trailingCommaMatch) {
          const commaPosition = lineContent.indexOf(",", trailingCommaMatch.index);
          return {
            line: i + 1,
            column: commaPosition + 1,
            message: "JSON 中不允许有尾随逗号",
          };
        }
      }

      // 4. 检查括号不匹配
      const stack = [];
      let charIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];

        for (let j = 0; j < lineContent.length; j++) {
          const char = lineContent[j];
          charIndex++;

          if (char === "{" || char === "[") {
            stack.push({ char, line: i + 1, column: j + 1 });
          } else if (char === "}" || char === "]") {
            if (stack.length === 0) {
              return {
                line: i + 1,
                column: j + 1,
                message: `意外的闭合 ${char}`,
              };
            }

            const last = stack.pop();
            const expected = last.char === "{" ? "}" : "]";

            if ((char === "}" && last.char !== "{") || (char === "]" && last.char !== "[")) {
              return {
                line: i + 1,
                column: j + 1,
                message: `意外的 ${char}，应为 ${expected}`,
              };
            }
          }
        }
      }

      if (stack.length > 0) {
        const last = stack.pop();
        return {
          line: last.line,
          column: last.column,
          message: `未闭合的 ${last.char}`,
        };
      }

      // 默认错误
      return {
        line: 1,
        column: 1,
        message: "JSON 语法错误",
      };
    },

    /**
     * 检查HTML代码中的错误 (简易版)
     * @param {string} code - 代码内容
     * @param {Object} model - 编辑器模型
     */
    checkHtmlErrors(code, model) {
      // 简单检查HTML标签是否匹配
      const markers = [];

      // 使用正则表达式检查未闭合的标签
      const openTags = [];
      const tagPattern = /<\/?([a-z0-9]+)[^>]*>/gi;
      let match;
      let lineCount = 1;
      let lastIndex = 0;

      while ((match = tagPattern.exec(code)) !== null) {
        // 计算当前行号
        const prevText = code.substring(lastIndex, match.index);
        const newLines = prevText.match(/\n/g);
        if (newLines) {
          lineCount += newLines.length;
        }
        lastIndex = match.index;

        const fullTag = match[0];
        const tagName = match[1].toLowerCase();

        if (fullTag.startsWith("</")) {
          // 闭合标签
          if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              message: `未匹配的闭合标签 </${tagName}>`,
              startLineNumber: lineCount,
              startColumn: match.index - (code.substring(0, match.index).lastIndexOf("\n") + 1) + 1,
              endLineNumber: lineCount,
              endColumn:
                match.index -
                (code.substring(0, match.index).lastIndexOf("\n") + 1) +
                fullTag.length +
                1,
            });
          } else {
            openTags.pop();
          }
        } else if (
          !fullTag.endsWith("/>") &&
          !["br", "hr", "img", "input", "link", "meta"].includes(tagName)
        ) {
          // 开放标签 (非自闭合)
          openTags.push(tagName);
        }
      }

      // 检查剩余未闭合的标签
      openTags.forEach(tag => {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: `未闭合的标签 <${tag}>`,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        });
      });

      // 设置标记
      monaco.editor.setModelMarkers(model, "codeCheck", markers);

      // 保存错误信息
      this.errors = markers;
      this.errorCount = markers.length;
      this.hasErrors = markers.length > 0;
    },

    /**
     * 检查代码中括号是否平衡
     * @param {string} code - 代码内容
     * @param {Array} markers - 错误标记数组
     */
    checkBracketBalance(code, markers) {
      const stack = [];
      const pairs = { "(": ")", "{": "}", "[": "]" };
      const lines = code.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (let j = 0; j < line.length; j++) {
          const char = line[j];

          if (char in pairs) {
            stack.push({ char, line: i + 1, col: j + 1 });
          } else if (Object.values(pairs).includes(char)) {
            const expected = Object.entries(pairs).find(([_, value]) => value === char)[0];

            if (stack.length === 0 || stack[stack.length - 1].char !== expected) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `意外的 '${char}'${
                  stack.length > 0 ? `，期望 '${pairs[stack[stack.length - 1].char]}'` : ""
                }`,
                startLineNumber: i + 1,
                startColumn: j + 1,
                endLineNumber: i + 1,
                endColumn: j + 2,
              });
            } else {
              stack.pop();
            }
          }
        }
      }

      // 检查未闭合的括号
      stack.forEach(bracket => {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: `未闭合的 '${bracket.char}'`,
          startLineNumber: bracket.line,
          startColumn: bracket.col,
          endLineNumber: bracket.line,
          endColumn: bracket.col + 1,
        });
      });
    },

    /**
     * 简易版检查未定义变量
     * @param {string} code - 代码内容
     * @param {Array} markers - 错误标记数组
     * @param {Set} functionParams - 函数参数集合
     */
    checkUndefinedVariables(code, markers, functionParams = new Set()) {
      // 这是一个简化版的实现，实际中应该使用更复杂的解析
      const lines = code.split("\n");
      const declaredVars = new Set();

      // 添加函数参数到已声明变量
      functionParams.forEach(param => declaredVars.add(param));

      // 常见的全局变量和内置对象
      const globalVars = new Set([
        "window",
        "document",
        "console",
        "setTimeout",
        "setInterval",
        "clearTimeout",
        "clearInterval",
        "localStorage",
        "sessionStorage",
        "fetch",
        "Promise",
        "Array",
        "Object",
        "function",
        "String",
        "Number",
        "Boolean",
        "Math",
        "Date",
        "JSON",
        "Error",
        "Map",
        "Set",
        "WeakMap",
        "WeakSet",
        "Proxy",
        "Reflect",
        "Symbol",
        "Int8Array",
        "Uint8Array",
        "this",
        "self",
        "global",
        "process",
        "require",
        "module",
        "exports",
        "glob",
      ]);

      // 提取声明的变量
      const varDeclarationRegex = /\b(?:var|let|const)\s+(\w+)/g;
      const functionDeclarationRegex = /\bfunction\s+(\w+)/g;
      const arrowFunctionRegex = /\b([\w$]+)\s*=\s*(?:\([^)]*\)|[\w$]+)\s*=>/g;
      const classDeclarationRegex = /\bclass\s+(\w+)/g;
      const importRegex = /\bimport\s+(?:{[^}]*}|\*\s+as\s+(\w+)|\s*(\w+))/g;
      const destructuringRegex = /\b(?:var|let|const|,)\s*{([^}]*)}(?:\s*=|\s*,|\s*$)/g;

      // 处理解构赋值中的变量
      const processDestructuring = destructureStr => {
        const parts = destructureStr.split(",");
        parts.forEach(part => {
          const match = part.trim().match(/^(\w+)(?:\s*:\s*\w+)?/);
          if (match && match[1]) {
            declaredVars.add(match[1].trim());
          }
        });
      };

      lines.forEach((line, lineIndex) => {
        // 清除注释，避免在注释中查找变量声明
        const lineWithoutComments = line.replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, "");

        let match;
        // 查找变量声明
        while ((match = varDeclarationRegex.exec(lineWithoutComments)) !== null) {
          declaredVars.add(match[1]);
        }

        // 查找函数声明
        while ((match = functionDeclarationRegex.exec(lineWithoutComments)) !== null) {
          declaredVars.add(match[1]);
        }

        // 查找箭头函数赋值
        while ((match = arrowFunctionRegex.exec(lineWithoutComments)) !== null) {
          declaredVars.add(match[1]);
        }

        // 查找类声明
        while ((match = classDeclarationRegex.exec(lineWithoutComments)) !== null) {
          declaredVars.add(match[1]);
        }

        // 查找import声明
        while ((match = importRegex.exec(lineWithoutComments)) !== null) {
          if (match[1]) declaredVars.add(match[1]);
          if (match[2]) declaredVars.add(match[2]);
        }

        // 查找解构赋值
        while ((match = destructuringRegex.exec(lineWithoutComments)) !== null) {
          if (match[1]) {
            processDestructuring(match[1]);
          }
        }
      });

      // 检查变量使用
      const variableUsageRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;

      lines.forEach((line, lineIndex) => {
        // 移除字符串和注释，避免误报
        const lineWithoutStrings = line.replace(/'.*?'|".*?"|`.*?`|\/\/.*$|\/\*[\s\S]*?\*\//g, "");
        let match;

        while ((match = variableUsageRegex.exec(lineWithoutStrings)) !== null) {
          const varName = match[1];

          // 跳过关键字和已声明的变量
          if (
            [
              "var",
              "let",
              "const",
              "function",
              "class",
              "if",
              "else",
              "for",
              "while",
              "do",
              "switch",
              "case",
              "default",
              "try",
              "catch",
              "finally",
              "throw",
              "return",
              "break",
              "continue",
              "new",
              "delete",
              "typeof",
              "instanceof",
              "void",
              "in",
              "of",
              "true",
              "false",
              "null",
              "undefined",
            ].includes(varName)
          ) {
            continue;
          }

          if (!declaredVars.has(varName) && !globalVars.has(varName)) {
            // 排除属性访问
            const beforeChar = lineWithoutStrings.charAt(match.index - 1);
            if (beforeChar !== "." && beforeChar !== "[") {
              // 避免报告已检查过的变量
              const varKey = `${lineIndex}-${match.index}-${varName}`;
              if (!this._reportedVars || !this._reportedVars.has(varKey)) {
                if (!this._reportedVars) this._reportedVars = new Set();
                this._reportedVars.add(varKey);

                markers.push({
                  severity: monaco.MarkerSeverity.Warning,
                  message: `可能未定义的变量 '${varName}'`,
                  startLineNumber: lineIndex + 1,
                  startColumn: match.index + 1,
                  endLineNumber: lineIndex + 1,
                  endColumn: match.index + varName.length + 1,
                });
              }
            }
          }
        }
      });
    },

    /**
     * 更新错误指示器状态
     */
    updateErrorIndicator() {
      this.hasErrors = this.errors.length > 0;
      this.errorCount = this.errors.length;
    },

    /**
     * 设置错误提示悬停监听
     */
    setupErrorTooltipListeners() {
      this.removeErrorTooltipListeners();
      // 使用更可靠的选择器找到错误按钮
      const errorBtn = this.$el.querySelector("button.toolbar-btn.toolbar-error-btn");
      if (errorBtn && errorBtn.parentElement) {
        const button = errorBtn.parentElement;
        this._errorTooltipButton = button;
        button.addEventListener("mouseenter", this.showErrorTooltip);
        button.addEventListener("mouseleave", this.hideErrorTooltip);

        // 给错误提示框也添加鼠标事件，使其在悬停时保持显示
        if (this.$refs.errorTooltip) {
          this._errorTooltipEl = this.$refs.errorTooltip;
          this._errorTooltipMouseEnterHandler = () => {
            clearTimeout(this._tooltipHideTimer);
          };
          this._errorTooltipEl.addEventListener(
            "mouseenter",
            this._errorTooltipMouseEnterHandler,
          );
          this._errorTooltipEl.addEventListener("mouseleave", this.hideErrorTooltip);
        }
      }
    },

    removeErrorTooltipListeners() {
      if (this._errorTooltipButton) {
        this._errorTooltipButton.removeEventListener("mouseenter", this.showErrorTooltip);
        this._errorTooltipButton.removeEventListener("mouseleave", this.hideErrorTooltip);
        this._errorTooltipButton = null;
      }
      if (this._errorTooltipEl) {
        if (this._errorTooltipMouseEnterHandler) {
          this._errorTooltipEl.removeEventListener(
            "mouseenter",
            this._errorTooltipMouseEnterHandler,
          );
        }
        this._errorTooltipEl.removeEventListener("mouseleave", this.hideErrorTooltip);
        this._errorTooltipEl = null;
        this._errorTooltipMouseEnterHandler = null;
      }
    },

    /**
     * 显示错误提示
     */
    showErrorTooltip() {
      if (!this.hasErrors || !this.$refs.errorTooltip) return;

      const tooltip = this.$refs.errorTooltip;
      tooltip.style.display = "block";

      // 获取错误按钮位置并设置提示框位置
      // 因为工具栏按钮顺序可能变化，使用更可靠的选择器
      const errorBtn = this.$el
        .querySelector("button.toolbar-btn.toolbar-error-btn")
        .closest("button");
      if (errorBtn) {
        const rect = errorBtn.getBoundingClientRect();
        const editorRect = this.$el.getBoundingClientRect();

        // 计算相对于编辑器容器的位置
        tooltip.style.left = `${rect.left - editorRect.left}px`;
        tooltip.style.top = `${rect.bottom - editorRect.top + 5}px`;

        // 确保提示框不超出右侧边界
        const containerWidth = this.$el.offsetWidth;
        const tooltipWidth = tooltip.offsetWidth;

        if (parseInt(tooltip.style.left) + tooltipWidth > containerWidth) {
          tooltip.style.left = `${containerWidth - tooltipWidth - 10}px`;
        }

        // 确保提示框不超出底部边界
        const containerHeight = this.$el.offsetHeight;
        const tooltipHeight = tooltip.offsetHeight;

        if (parseInt(tooltip.style.top) + tooltipHeight > containerHeight) {
          // 如果下方放不下，就放在按钮上方
          tooltip.style.top = `${rect.top - editorRect.top - tooltipHeight - 5}px`;
        }
      }
    },

    /**
     * 隐藏错误提示
     */
    hideErrorTooltip() {
      if (this.$refs.errorTooltip) {
        // 延迟隐藏，以便用户能够移动到提示框
        clearTimeout(this._tooltipHideTimer); // 先清除可能存在的计时器
        this._tooltipHideTimer = setTimeout(() => {
          const tooltip = this.$refs.errorTooltip;
          if (tooltip) {
            tooltip.style.display = "none";
          }
        }, 300);
      }
    },

    /**
     * 跳转到指定错误位置
     * @param {Object} error - 错误对象
     */
    goToError(error) {
      if (!this.editor) return;

      const editor = this._getEditor();
      editor.revealPositionInCenter({
        lineNumber: error.startLineNumber,
        column: error.startColumn,
      });

      // 设置光标位置
      editor.setPosition({
        lineNumber: error.startLineNumber,
        column: error.startColumn,
      });

      // 获取焦点
      editor.focus();

      // 隐藏提示框
      this.hideErrorTooltip();
    },

    /**
     * 显示错误列表
     */
    showErrorList() {
      if (!this.hasErrors) return;

      // 显示错误提示
      this.showErrorTooltip();
    },
  },
};
