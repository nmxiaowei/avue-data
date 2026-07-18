import chartMixin from "@/echart/common";
import { KEY_COMPONENT_NAME } from "@/echart/variable";

const modules = import.meta.glob("./**/index.vue", { eager: true });

export default Object.values(modules).reduce((components, module) => {
  const source = module.default;
  if (!source?.name) return components;

  const component = {
    ...source,
    name: KEY_COMPONENT_NAME + source.name,
    mixins: [chartMixin, ...(source.mixins || [])],
  };
  components[component.name] = component;
  return components;
}, {});
