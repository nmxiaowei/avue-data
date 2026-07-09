<template>
  <template v-if="item.type === 'params'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">参数传递</h4>
      </div>
      <el-form-item label="目标组件">
        <avue-input-tree
          multiple
          filterable
          check-strictly
          placeholder="请选择目标组件"
          v-model="item.index"
          :dic="childrenDic"
          :props="{ label: 'name', value: 'index' }">
        </avue-input-tree>
      </el-form-item>
      <param-list
        :list="item.child"
        add-text="新增参数"
        name-label="参数名称"
        value-label="映射字段"
        :with-position="true" />
    </div>
  </template>

  <template v-else-if="item.type === 'group'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">大屏切换</h4>
      </div>
      <el-form-item label="目标大屏">
        <avue-select
          :dic="contain.config.group"
          v-model="item.group"
          placeholder="请选择要切换到的大屏"
          :props="{ label: 'name', value: 'id' }">
        </avue-select>
      </el-form-item>
    </div>
  </template>

  <template v-else-if="item.type === 'href'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">页面跳转</h4>
      </div>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="新窗口">
            <avue-switch v-model="item.target"></avue-switch>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="跳转地址">
            <avue-input v-model="item.src" placeholder="请输入跳转地址"></avue-input>
          </el-form-item>
        </el-col>
      </el-row>
      <param-list
        :list="item.child"
        add-text="新增 URL 参数"
        name-label="参数名称"
        value-label="映射字段" />
    </div>
  </template>

  <template v-else-if="item.type === 'display'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">显隐控制</h4>
      </div>
      <el-row :gutter="16">
        <el-col :span="16">
          <el-form-item label="目标组件">
            <avue-input-tree
              multiple
              check-strictly
              placeholder="请选择目标组件"
              filterable
              v-model="item.index"
              :dic="childrenDic"
              :props="{ label: 'name', value: 'index' }">
            </avue-input-tree>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="显示操作">
            <avue-select
              v-model="item.displayType"
              :empty-values="[undefined]"
              :dic="dic.displayType"
              placeholder="请选择操作类型">
            </avue-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </template>

  <template v-else-if="item.type === 'sendApi'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">发送 API 数据</h4>
      </div>
      <el-row :gutter="16">
        <el-col :span="16">
          <el-form-item label="请求地址">
            <avue-input v-model="item.url" placeholder="请输入 API 请求地址"></avue-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="请求方式">
            <avue-select v-model="item.method" :dic="dic.apiMethod" placeholder="请选择请求方式">
            </avue-select>
          </el-form-item>
        </el-col>
      </el-row>
      <param-list
        :list="item.child"
        add-text="新增请求参数"
        name-label="参数名称"
        value-label="映射字段"
        :with-position="true" />
    </div>
  </template>

  <template v-else-if="item.type === 'dialog'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">弹窗显示</h4>
      </div>
      <el-form-item label="弹窗标题">
        <avue-input v-model="item.title" placeholder="请输入弹窗标题"></avue-input>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="显示组件">
            <avue-input-tree
              check-strictly
              multiple
              placeholder="请选择弹窗内显示的组件"
              filterable
              v-model="item.index"
              :dic="childrenDic"
              :props="{ label: 'name', value: 'index' }">
            </avue-input-tree>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联大屏">
            <avue-select
              :dic="contain.config.group"
              v-model="item.group"
              placeholder="请选择关联大屏"
              :props="{ label: 'name', value: 'id' }">
            </avue-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </template>

  <template v-else-if="item.type === 'move'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">组件移动</h4>
      </div>
      <el-form-item label="目标组件">
        <avue-input-tree
          check-strictly
          multiple
          placeholder="请选择要移动的组件"
          filterable
          v-model="item.index"
          :dic="childrenDic"
          :props="{ label: 'name', value: 'index' }">
        </avue-input-tree>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="横坐标">
            <avue-input v-model="item.left" type="number" placeholder="请输入 left"></avue-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="纵坐标">
            <avue-input v-model="item.top" type="number" placeholder="请输入 top"></avue-input>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </template>

  <template v-else-if="item.type === 'refresh'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">刷新数据</h4>
      </div>
      <el-form-item label="目标组件">
        <avue-input-tree
          check-strictly
          multiple
          placeholder="请选择要刷新数据的组件"
          filterable
          v-model="item.index"
          :dic="childrenDic"
          :props="{ label: 'name', value: 'index' }">
        </avue-input-tree>
      </el-form-item>
    </div>
  </template>

  <template v-else-if="item.type === 'style'">
    <div class="event-section">
      <div class="section-header">
        <h4 class="section-title">设置样式</h4>
      </div>
      <el-form-item label="目标组件">
        <avue-input-tree
          multiple
          check-strictly
          placeholder="请选择目标组件"
          filterable
          v-model="item.index"
          :dic="childrenDic"
          :props="{ label: 'name', value: 'index' }">
        </avue-input-tree>
      </el-form-item>
      <param-list
        :list="item.child"
        add-text="新增样式"
        name-label="属性名"
        value-label="属性值" />
    </div>
  </template>
</template>

<script>
const ParamList = {
  name: "ParamList",
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    addText: String,
    nameLabel: String,
    valueLabel: String,
    withPosition: Boolean,
  },
  data() {
    return {
      paramPosition: [
        { label: "Query参数", value: "query" },
        { label: "Body参数", value: "body" },
        { label: "Headers参数", value: "headers" },
      ],
    };
  },
  methods: {
    add() {
      this.list.push({});
    },
    remove(index) {
      this.list.splice(index, 1);
    },
  },
  template: `
    <div class="params-container">
      <div class="params-header">
        <span class="params-title">参数列表</span>
        <el-button type="primary" icon="el-icon-plus" @click="add" class="add-param-btn">
          {{ addText }}
        </el-button>
      </div>
      <div v-if="!list || list.length === 0" class="empty-params">
        <el-empty description="暂无参数配置" :image-size="60"></el-empty>
      </div>
      <div v-for="(citem, cindex) in list" :key="cindex" class="param-item">
        <div class="param-card">
          <div class="param-header">
            <span class="param-title">参数 {{ cindex + 1 }}</span>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              circle
              @click="remove(cindex)">
            </el-button>
          </div>
          <div class="param-body">
            <el-row :gutter="12">
              <el-col :span="withPosition ? 8 : 12">
                <el-form-item :label="nameLabel" class="form-item-compact">
                  <avue-input v-model="citem.name" placeholder="请输入名称"></avue-input>
                </el-form-item>
              </el-col>
              <el-col :span="withPosition ? 8 : 12">
                <el-form-item :label="valueLabel" class="form-item-compact">
                  <avue-input v-model="citem.value" placeholder="请输入值"></avue-input>
                </el-form-item>
              </el-col>
              <el-col v-if="withPosition" :span="8">
                <el-form-item label="参数位置" class="form-item-compact">
                  <avue-select v-model="citem.position" :dic="paramPosition"></avue-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
  `,
};

export default {
  inject: ["contain"],
  components: { ParamList },
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      dic: {
        displayType: [
          { label: "隐藏", value: true },
          { label: "显示", value: false },
          { label: "显示/隐藏", value: "" },
        ],
        apiMethod: [
          { label: "GET", value: "get" },
          { label: "POST", value: "post" },
          { label: "PUT", value: "put" },
          { label: "DELETE", value: "delete" },
        ],
      },
    };
  },
  computed: {
    childrenDic() {
      return this.deepClone(this.contain.nav);
    },
  },
  created() {
    if (!Array.isArray(this.item.child)) this.item.child = [];
  },
};
</script>

<style lang="scss" scoped>
.param-item {
  margin-bottom: 16px;
}

.param-card {
  border-radius: 6px;
  border: 1px solid var(--border-color-base);
  transition: all 0.3s ease;
  margin-bottom: 8px;

  &:hover {
    box-shadow: 0 2px 8px var(--shadow-color);
    border-color: var(--border-color-hover);
  }
}

.param-header {
  background-color: var(--bg-color-light);
  border-bottom: 1px solid var(--border-color-light);
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px 6px 0 0;
}

.param-body {
  background-color: var(--bg-color-card);
  padding: 10px 12px;
  border-radius: 0 0 6px 6px;
}

.param-title,
.params-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color-primary);
}

.event-section {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.section-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color-primary);
}

.params-container {
  margin-top: 16px;
}

.params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.empty-params {
  text-align: center;
  padding: 20px;
}
</style>
