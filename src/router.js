import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";

const base = import.meta.env.VITE_APP_BASE;
const isHashMode = import.meta.env.MODE === "hash";

const vueRouter = createRouter({
  base,
  history: isHashMode ? createWebHashHistory(base) : createWebHistory(base),
  routes: [],
});

export function registerRoutes(config) {
  const mainPath = config?.routers?.mainPath || "/";

  const routes = [
    {
      path: mainPath,
      component: () => import("@/page/layout/index.vue"),
      children: [
        {
          path: "",
          name: "home",
          component: () => import("@/page/list/home.vue"),
        },
        {
          path: "home",
          name: "homePage",
          component: () => import("@/page/list/home.vue"),
        },
        {
          path: "list",
          name: "list",
          component: () => import("@/page/list/index.vue"),
        },
        {
          path: "file",
          name: "file",
          component: () => import("@/page/list/file.vue"),
        },
        {
          path: "config",
          name: "config",
          component: () => import("@/page/list/config.vue"),
        },
      ],
    },
    {
      path: mainPath + "build/:id",
      name: "build",
      component: () => import("@/page/build.vue"),
    },
    {
      path: mainPath + "view/:id",
      name: "view",
      component: () => import("@/page/view.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: mainPath,
    },
  ];

  routes.forEach(route => {
    vueRouter.addRoute(route);
  });
}

vueRouter.beforeEach((to, from, next) => {
  next();
});

export default vueRouter;
