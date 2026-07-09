<template>
  <div class="filters-panel">
    <el-button type="primary" class="filters-panel__add" icon="el-icon-plus" @click="handleAdd">
      新增过滤器
    </el-button>

    <ul class="menu__ul" v-if="filterList.length">
      <li class="menu__item" v-for="item in filterList" :key="item.id">
        <span class="menu__icon">
          <svg-icon icon-class="filters" />
        </span>
        <span class="menu__label">
          <input type="text" v-model="item.name" />
        </span>
        <span class="menu__menu">
          <el-icon @click.stop="handleEdit(item)">
            <el-icon-edit></el-icon-edit>
          </el-icon>
          <el-icon @click.stop="handleDel(item)">
            <el-icon-delete></el-icon-delete>
          </el-icon>
        </span>
      </li>
    </ul>

    <div v-else class="empty-tip">
      <el-icon size="32"><el-icon-filter /></el-icon>
      <p>暂无过滤器</p>
      <p class="sub-tip">点击“新增过滤器”添加数据过滤器</p>
    </div>

    <codeedit
      v-if="code.box"
      v-model="code.obj"
      v-model:visible="code.box"
      :title="`${form.name || '过滤器'}配置`"
      :type="code.type"
      language="javascript"
      @submit="codeClose"></codeedit>
  </div>
</template>

<script>
import codeedit from "@/page/group/code.vue";
import { uuid } from "@/utils/utils";

export default {
  inject: ["contain"],
  components: {
    codeedit,
  },
  data() {
    return {
      code: {
        type: "dataFormatter",
        box: false,
        obj: "",
      },
      form: {},
    };
  },
  computed: {
    filterList() {
      const filters = this.ensureFilters();
      return Object.keys(filters).map(key => filters[key]);
    },
  },
  created() {
    this.ensureFilters();
  },
  methods: {
    ensureFilters() {
      if (!this.contain.config.filters || typeof this.contain.config.filters !== "object") {
        this.contain.config.filters = {};
      }
      return this.contain.config.filters;
    },
    handleAdd() {
      const filters = this.ensureFilters();
      const id = uuid();
      filters[id] = {
        id,
        name: "新增过滤器",
        isname: true,
        dataFormatter: `(data,params,refs)=>{
  return data
}`,
      };
      this.handleEdit(filters[id]);
    },
    handleEdit(item) {
      this.form = item;
      this.code.obj = item.dataFormatter || "";
      this.code.box = true;
    },
    codeClose(value) {
      if (!this.form.id) return;
      this.ensureFilters()[this.form.id].dataFormatter = value;
    },
    clearComponentFilter(id) {
      const clearList = list => {
        (list || []).forEach(item => {
          if (item.dataFormatterId === id) item.dataFormatterId = "";
          if (item.children) clearList(item.children);
        });
      };
      clearList(this.contain.nav);
    },
    handleDel(item) {
      this.$confirm(`是否删除【${item.name}】过滤器？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        delete this.ensureFilters()[item.id];
        this.clearComponentFilter(item.id);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.filters-panel {
  padding: 10px;

  &__add {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>
