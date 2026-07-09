<!-- 表格配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="基础设置">
        <el-form-item label="排名">
          <avue-switch v-model="main.activeOption.index"></avue-switch>
        </el-form-item>
        <el-form-item label="多选">
          <avue-switch v-model="main.activeOption.selection"></avue-switch>
        </el-form-item>
        <el-form-item label="边框">
          <avue-switch v-model="main.activeOption.border"></avue-switch>
        </el-form-item>
        <el-form-item label="高亮当前行">
          <avue-switch v-model="main.activeOption.highlightCurrentRow"></avue-switch>
        </el-form-item>
        <el-form-item label="尺寸">
          <avue-select v-model="main.activeOption.size"
                       :dic="dicOption.tableSize">
          </avue-select>
        </el-form-item>
        <el-form-item label="空数据文字">
          <avue-input v-model="main.activeOption.emptyText" placeholder="暂无数据"></avue-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="滚动设置">
        <el-form-item label="开启滚动">
          <avue-switch v-model="main.activeOption.scroll"></avue-switch>
        </el-form-item>
        <template v-if="main.activeOption.scroll">
          <el-form-item label="停顿间隔">
            <el-input v-model="main.activeOption.scrollTime" type="number">
              <template #append>毫秒</template>
            </el-input>
          </el-form-item>
          <el-form-item label="滚动速度">
            <el-input v-model="main.activeOption.scrollSpeed" type="number">
              <template #append>像素</template>
            </el-input>
          </el-form-item>
          <el-form-item label="滚动行数">
            <el-input v-model="main.activeOption.scrollRows" type="number">
              <template #append>行</template>
            </el-input>
          </el-form-item>
        </template>
      </el-collapse-item>
      <el-collapse-item title="表头设置">
        <el-form-item label="显示">
          <avue-switch v-model="main.activeOption.showHeader"></avue-switch>
        </el-form-item>
        <el-form-item label="字体大小">
          <avue-input-number v-model="main.activeOption.headerFontSize"></avue-input-number>
        </el-form-item>
        <el-form-item label="背景颜色">
          <avue-input-color
            type="textarea"
            v-model="main.activeOption.headerBackground"></avue-input-color>
        </el-form-item>
        <el-form-item label="字体颜色">
          <avue-input-color
            type="textarea"
            v-model="main.activeOption.headerColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="对其方式">
          <avue-select
            v-model="main.activeOption.headerTextAlign"
            :dic="dicOption.textAlign"></avue-select>
        </el-form-item>
        <el-form-item label="表头高度">
          <avue-input-number v-model="main.activeOption.headerHeight"></avue-input-number>
        </el-form-item>
        <el-form-item label="文字粗细">
          <avue-select v-model="main.activeOption.headerFontWeight"
                       :dic="dicOption.fontWeight">
          </avue-select>
        </el-form-item>
        <el-form-item label="字体家族">
          <avue-select v-model="main.activeOption.headerFontFamily"
                       :dic="dicOption.fontFamily">
          </avue-select>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="表格设置">
        <el-form-item label="文字颜色">
          <avue-input-color
            type="textarea"
            v-model="main.activeOption.bodyColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="字体大小">
          <avue-input-number v-model="main.activeOption.bodyFontSize"></avue-input-number>
        </el-form-item>
        <el-form-item label="对其方式">
          <avue-select
            v-model="main.activeOption.bodyTextAlign"
            :dic="dicOption.textAlign"></avue-select>
        </el-form-item>
        <el-form-item label="显示行数">
          <avue-input-number v-model="main.activeOption.count"></avue-input-number>
        </el-form-item>
        <el-form-item label="奇行颜色">
          <avue-input-color type="textarea" v-model="main.activeOption.nthColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="偶行颜色">
          <avue-input-color type="textarea" v-model="main.activeOption.othColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="文字粗细">
          <avue-select v-model="main.activeOption.bodyFontWeight"
                       :dic="dicOption.fontWeight">
          </avue-select>
        </el-form-item>
        <el-form-item label="字体家族">
          <avue-select v-model="main.activeOption.bodyFontFamily"
                       :dic="dicOption.fontFamily">
          </avue-select>
        </el-form-item>
        <el-form-item label="行高">
          <avue-input-number v-model="main.activeOption.bodyLineHeight" :max="200"></avue-input-number>
        </el-form-item>
        <el-form-item label="行样式">
          <monaco-editor
            v-model="main.activeOption.rowStyleFormatter"
            language="javascript"
            disabled
            height="100"></monaco-editor>
          <el-button
            type="primary"
            icon="el-icon-edit"
            class="el-button--bottom"
            @click="openCode('rowStyleFormatter', '行样式')"
            >编辑</el-button
          >
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="边框设置">
        <el-form-item label="边框颜色">
          <avue-input-color v-model="main.activeOption.tableBorderColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="边框样式">
          <avue-select v-model="main.activeOption.tableBorderStyle"
                       :dic="dicOption.borderStyle">
          </avue-select>
        </el-form-item>
        <el-form-item label="边框宽度">
          <avue-input-number v-model="main.activeOption.tableBorderWidth" :max="10"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
      <avue-crud
        :key="refreshKey"
        :option="tableOption"
        :data="main.activeOption.column"
        @sortable-change="sortableChange"
        v-model="form"
        @row-save="rowSave"
        @row-del="rowDel"
        @row-update="rowUpdate">
        <template #formatter-form="{}">
          <monaco-editor
            v-model="form.formatter"
            language="javascript"
            disabled
            height="100"></monaco-editor>
          <el-button
            type="primary"
            icon="el-icon-edit"
            class="el-button--bottom"
            @click="openCode('formatter', '单元格内容')"
            >编辑</el-button
          >
        </template>
        <template #cellStyleFormatter-form="{}">
          <monaco-editor
            v-model="form.cellStyleFormatter"
            language="javascript"
            disabled
            height="100"></monaco-editor>
          <el-button
            type="primary"
            icon="el-icon-edit"
            class="el-button--bottom"
            @click="openCode('cellStyleFormatter', '单元格样式')"
            >编辑</el-button
          >
        </template>
        <template #menu-left="{}">
          <el-button
            icon="el-icon-operation"
            @click="openCode('column', '表格列设置', true)"
            type="primary"
            >数据结构</el-button
          >
        </template>
      </avue-crud>
    </el-collapse>
    <codeedit
      @submit="codeClose"
      :title="code.title"
      :is-object="code.isObject"
      v-model="code.obj"
      v-if="code.box"
      :default-value="code.defaultValue"
      :type="code.type"
      v-model:visible="code.box"></codeedit>
  </div>
</template>

<script>
import MonacoEditor from "@/page/components/monaco-editor";
import { dicOption } from "@/option/config";
import codeedit from "../../page/group/code.vue";

export default {
  name: "table",
  data() {
    return {
      refreshKey: Math.random(),
      form: {},
      dicOption: dicOption,
      tableOption: {
        refreshBtn: false,
        columnBtn: false,
        gridBtn: false,
        labelWidth: 90,
        rowSort: true,
        column: [
          {
            label: "列名称",
            prop: "label",
            formatter: row => {
              return `${row.label}(${row.prop})`;
            },
          },
          {
            label: "key值",
            hide: true,
            prop: "prop",
          },
          {
            label: "宽度",
            prop: "width",
            hide: true,
            type: "number",
          },
          {
            label: "最小宽度",
            prop: "minWidth",
            hide: true,
            type: "number",
          },
          {
            label: "固定列",
            prop: "fixed",
            hide: true,
            type: "select",
            dicData: [
              { label: "不固定", value: false },
              { label: "左固定", value: "left" },
              { label: "右固定", value: "right" },
            ],
          },
          {
            label: "对齐方式",
            prop: "align",
            hide: true,
            type: "select",
            dicData: [
              { label: "左对齐", value: "left" },
              { label: "居中", value: "center" },
              { label: "右对齐", value: "right" },
            ],
          },
          {
            label: "表头对齐",
            prop: "headerAlign",
            hide: true,
            type: "select",
            dicData: [
              { label: "左对齐", value: "left" },
              { label: "居中", value: "center" },
              { label: "右对齐", value: "right" },
            ],
          },
          {
            label: "自定义类名",
            prop: "className",
            hide: true,
            type: "input",
          },
          {
            label: "排序",
            prop: "sortable",
            hide: true,
            type: "switch",
            value: false,
            dicData: [
              { label: "开启", value: true },
              { label: "关闭", value: false },
            ],
          },
          {
            label: "溢出隐藏",
            prop: "showOverflowTooltip",
            hide: true,
            type: "switch",
            value: true,
            dicData: [
              { label: "开启", value: true },
              { label: "关闭", value: false },
            ],
          },
          {
            label: "状态",
            prop: "hide",
            hide: true,
            type: "switch",
            value: false,
            dicData: [
              {
                label: "隐藏",
                value: true,
              },
              {
                label: "显示",
                value: false,
              },
            ],
          },
          {
            label: "单元格内容",
            hide: true,
            prop: "formatter",
            type: "textarea",
            span: 24,
          },
          {
            label: "单元格样式",
            hide: true,
            prop: "cellStyleFormatter",
            type: "textarea",
            span: 24,
          },
        ],
      },
      code: {
        box: false,
        type: "",
        obj: {},
      },
    };
  },
  inject: ["main"],
  components: {
    codeedit,
    MonacoEditor,
  },
  methods: {
    sortableChange(oldIndex, newIndex) {
      const columns = this.main.activeOption.column;
      const [movedItem] = columns.splice(oldIndex, 1);
      columns.splice(newIndex, 0, movedItem);
      this.refreshKey = Math.random();
    },
    rowSave(row, done) {
      this.main.activeOption.column.push(this.deepClone(row));
      done();
    },
    rowDel(row, index) {
      this.main.activeOption.column.splice(index, 1);
    },
    rowUpdate(row, index, done) {
      this.main.activeOption.column.splice(index, 1, this.deepClone(row));
      done();
    },
    codeClose(value) {
      if (this.code.type == "formatter") {
        this.form.formatter = value;
      } else if (this.code.type == "cellStyleFormatter") {
        this.form.cellStyleFormatter = value;
      } else if (this.code.type == "rowStyleFormatter") {
        this.main.activeOption.rowStyleFormatter = value;
      } else {
        this.main.activeOption.column = value;
      }
    },
    openCode(type, title, isObject) {
      this.code.title = title;
      this.code.type = type;
      this.code.isObject = isObject;
      if (type == "formatter") {
        this.code.obj = this.form.formatter;
        this.code.defaultValue = `(column,row)=>{
    console.log(column,row)
    return ''
}`;
      } else if (type == "cellStyleFormatter") {
        this.code.obj = this.form.cellStyleFormatter;
        this.code.defaultValue = `(column,row,value)=>{
    console.log(column,row,value)
    return {}
}`;
      } else if (type == "rowStyleFormatter") {
        this.code.obj = this.main.activeOption.rowStyleFormatter;
        this.code.defaultValue = `(row)=>{
    console.log(row)
    return {}
}`;
      } else {
        this.code.obj = this.main.activeOption.column;
      }
      this.code.box = true;
    },
  },
};
</script>

<style scoped>
/* 样式分离 */
</style>
