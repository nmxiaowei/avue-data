const modules = import.meta.glob("./packages/**/*.vue", { eager: true });

export default Object.values(modules).reduce((components, module) => {
  const component = module.default;
  if (component?.name) components[component.name] = component;
  return components;
}, {});
