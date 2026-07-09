<template>
  <div
    :class="[b(), className]"
    :style="styleSizeName"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <el-table
      :style="[styleChartName, tableContainerStyle]"
      ref="table"
      @cell-click="cellClick"
      @cell-dblclick="cellDblClick"
      @selection-change="handleSelectionChange"
      :data="dataChart"
      :height="height"
      :border="option.border"
      :size="option.size"
      :highlight-current-row="option.highlightCurrentRow"
      :cell-style="cellStyle"
      :row-style="rowStyle"
      :show-header="showHeader"
      :header-row-style="headerRowStyle"
      :header-cell-style="headerCellStyle"
      :empty-text="option.emptyText || '暂无数据'"
      :loading="option.loading"
      v-loading="option.loading">
      <el-table-column
        fixed="left"
        type="selection"
        width="55"
        align="center"
        v-if="option.selection">
      </el-table-column>
      <el-table-column
        type="index"
        label="#"
        header-align="center"
        align="center"
        fixed="left"
        v-if="option.index"
        width="60">
        <template #default="{ $index }">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column width="1px"></el-table-column>
      <template v-for="(item, index) in option.column">
        <el-table-column
          v-if="item.hide !== true"
          :key="index"
          :class-name="item.className"
          :show-overflow-tooltip="item.showOverflowTooltip"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :fixed="item.fixed"
          :align="item.align"
          :header-align="item.headerAlign"
          :sortable="item.sortable">
          <template #default="{ row }">
            <span v-html="getFormatter(item, row)" v-if="item.formatter" :key="refreshKey"></span>
            <span v-else>{{ row[item.prop] }}</span>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
import create from "../../create";
import { getFunction } from "@/utils/utils";
export default create({
  name: "table",
  data() {
    return {
      refreshKey: Math.random(),
      headerHeight: "",
      scrollTimer: null,
      waitTimers: [],
      tableUnmounted: false,
      isPaused: false,
      scrollTop: 0,
      isWaitingAtTop: false,
      lastRowScrolled: 0,
      rowsScrolledSinceLastPause: 0,
    };
  },
  watch: {
    "option.column"() {
      this.refreshKey = Math.random();
    },
    scroll: {
      handler(val) {
        if (val) {
          this.startScroll();
        } else {
          this.stopScroll();
        }
      },
      immediate: true,
    },
  },
  computed: {
    showHeader() {
      return this.option.showHeader;
    },
    highlightCurrentRow() {
      return this.option.highlightCurrentRow ?? false;
    },
    scrollTime() {
      return this.option.scrollTime;
    },
    scrollSpeed() {
      return this.option.scrollSpeed || 1;
    },
    scrollRows() {
      return this.option.scrollRows || 1;
    },
    scroll() {
      return this.option.scroll;
    },
    computedHeaderHeight() {
      if (this.option.headerHeight) {
        return this.option.headerHeight;
      }
      return this.headerHeight || 0;
    },
    cellHeight() {
      return parseInt((this.height - this.computedHeaderHeight) / this.option.count);
    },
    rowStyleFormatter() {
      return this.option.rowStyleFormatter;
    },
    tableContainerStyle() {
      const style = {};
      if (this.option.tableBorderColor) {
        style['--el-table-border-color'] = this.option.tableBorderColor;
      }
      return style;
    },
  },
  props: {
    option: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  methods: {
    getFormatter(item, row) {
      try {
        return getFunction(item.formatter)(item, row);
      } catch (e) {}
    },
    getCellStyleFormatter(item, row, value) {
      try {
        return getFunction(item.cellStyleFormatter)(item, row, value);
      } catch (e) {}
    },
    getRowStyleFormatter(row) {
      try {
        return getFunction(this.rowStyleFormatter)(row);
      } catch (e) {}
    },
    handleMouseEnter() {
      if (this.scroll && !this.isPaused) {
        this.pauseScroll();
      }
    },
    handleMouseLeave() {
      this.handleCommonBind(null, null, "mouseLeaveFormatter");
      if (this.scroll && this.isPaused) {
        this.resumeScroll();
      }
    },
    cellClick(row, column, cell, event) {
      this.handleCommonBind(row, column, "clickFormatter");
    },
    cellDblClick(row, column, cell, event) {
      this.handleCommonBind(row, column, "dblClickFormatter");
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      let style = {
        padding: 0,
        textAlign: column.type == "index" ? "center" : this.option.bodyTextAlign,
      };
      const columnConfig = this.option.column.find(item => item.prop === column.property);
      if (columnConfig && columnConfig.cellStyleFormatter) {
        const customStyle = this.getCellStyleFormatter(columnConfig, row, row[columnConfig.prop]);
        if (customStyle && typeof customStyle === "object") {
          style = { ...style, ...customStyle };
        }
      }

      return style;
    },
    rowStyle({ row, rowIndex }) {
      let style = {
        height: this.setPx(this.cellHeight),
        fontSize: this.setPx(this.option.bodyFontSize),
        color: this.option.bodyColor,
        backgroundColor: rowIndex % 2 == 0 ? this.option.othColor : this.option.nthColor,
        fontWeight: this.option.bodyFontWeight || 'normal',
        fontFamily: this.option.bodyFontFamily,
        lineHeight: this.option.bodyLineHeight ? this.setPx(this.option.bodyLineHeight) : undefined,
      };
      const customStyle = this.getRowStyleFormatter(row);
      if (customStyle && typeof customStyle === "object") {
        style = { ...style, ...customStyle };
      }
      return style;
    },
    headerRowStyle() {
      const style = {
        backgroundColor: this.option.headerBackground,
      };

      if (this.option.headerHeight) {
        style.height = this.setPx(this.option.headerHeight);
        this.headerHeight = this.option.headerHeight;
      } else {
        this.$nextTick(() => {
          const tableEl = this.$refs.table;
          if (tableEl && tableEl.$el) {
            const headerEl = tableEl.$el.querySelector(".el-table__header-wrapper");
            if (headerEl) {
              this.headerHeight = headerEl.offsetHeight;
            }
          }
        });
      }

      return style;
    },
    headerCellStyle({ row, column, rowIndex, columnIndex }) {
      return {
        fontSize: this.setPx(this.option.headerFontSize),
        backgroundColor: this.option.headerBackground,
        color: this.option.headerColor,
        textAlign: column.type == "index" ? "center" : this.option.headerTextAlign,
        fontWeight: this.option.headerFontWeight || 'normal',
        fontFamily: this.option.headerFontFamily,
      };
    },
    handleSelectionChange(selection) {
      this.handleChange(selection);
    },
    startScroll() {
      if (this.tableUnmounted) return;
      if (!this.scroll || this.scrollTimer) return;

      // 首次开启滚动时暂停
      if (this.scrollTime && this.scrollTime > 0) {
        this.isWaitingAtTop = true;
        this.setWaitTimer(() => {
          this.isWaitingAtTop = false;
        }, this.scrollTime);
      }

      this.$nextTick(() => {
        if (this.tableUnmounted) return;
        const bodyWrapper = this.$refs.table?.$refs?.bodyWrapper;
        const tableEl = bodyWrapper?.querySelector(".el-scrollbar__wrap");
        if (!tableEl) return;
        this.scrollTimer = setInterval(() => {
          if (this.tableUnmounted) {
            this.stopScroll();
            return;
          }
          if (this.isPaused) return;

          const maxScrollTop = tableEl.scrollHeight - tableEl.clientHeight;
          if (maxScrollTop <= 0) return;

          // 如果正在等待，跳过滚动
          if (this.isWaitingAtTop) return;

          this.scrollTop += this.scrollSpeed * 0.5;

          // 检查是否滚动了一行的高度
          const currentRow = Math.floor(this.scrollTop / this.cellHeight);
          if (currentRow > this.lastRowScrolled) {
            this.lastRowScrolled = currentRow;
            this.rowsScrolledSinceLastPause++;

            // 检查是否达到设定的滚动行数后需要停顿
            if (this.rowsScrolledSinceLastPause >= this.scrollRows) {
              this.rowsScrolledSinceLastPause = 0; // 重置计数器
              // 如果设置了scrollTime，则暂停指定时间
              if (this.scrollTime && this.scrollTime > 0) {
                this.isWaitingAtTop = true;
                this.setWaitTimer(() => {
                  this.isWaitingAtTop = false;
                }, this.scrollTime);
              }
            }
          }

          if (this.scrollTop >= maxScrollTop) {
            // 如果设置了scrollTime，在滚到最后时也要停顿
            if (this.scrollTime && this.scrollTime > 0 && !this.isWaitingAtTop) {
              this.isWaitingAtTop = true;
              this.setWaitTimer(() => {
                this.scrollTop = 0;
                this.lastRowScrolled = 0;
                this.rowsScrolledSinceLastPause = 0;
                tableEl.scrollTop = this.scrollTop;
                this.setWaitTimer(() => {
                  this.isWaitingAtTop = false;
                }, this.scrollTime);
              }, this.scrollTime);
            } else if (!this.scrollTime) {
              // 如果没有设置scrollTime，直接重置
              this.scrollTop = 0;
              this.lastRowScrolled = 0;
              this.rowsScrolledSinceLastPause = 0;
            }
          }

          tableEl.scrollTop = this.scrollTop;
        }, 50);
      });
    },
    stopScroll() {
      if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
      }
      this.scrollTop = 0;
      this.isPaused = false;
      this.isWaitingAtTop = false;
      this.lastRowScrolled = 0;
      this.rowsScrolledSinceLastPause = 0;
      this.waitTimers.forEach(timer => clearTimeout(timer));
      this.waitTimers = [];
    },
    setWaitTimer(callback, delay) {
      if (this.tableUnmounted) return null;

      const timer = setTimeout(() => {
        this.waitTimers = this.waitTimers.filter(item => item !== timer);
        if (this.tableUnmounted) return;
        callback();
      }, delay);
      this.waitTimers.push(timer);
      return timer;
    },
    pauseScroll() {
      this.isPaused = true;
    },
    resumeScroll() {
      this.isPaused = false;
    },
  },
  mounted() {
    if (this.scroll) {
      this.startScroll();
    }
  },
  beforeDestroy() {
    this.tableUnmounted = true;
    this.stopScroll();
  },
  beforeUnmount() {
    this.tableUnmounted = true;
    this.stopScroll();
  },
});
</script>
