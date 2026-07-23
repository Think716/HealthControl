import { useCommonStore } from "@/store";
import AdminLayout from "@/views/Admin/Layout/index.vue";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { createRouter, createWebHashHistory } from "vue-router";

// 配置 NProgress
NProgress.configure({
  showSpinner: false, // 不显示加载圈
  speed: 1000,
  trickle: false,
});

// 路由配置
const routes = [
  {
    path: "/",
    redirect: "/Admin",
  },
  {
    path: "/Login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/Register",
    name: "Register",
    component: () => import("../views/Register.vue"),
  },
  {
    path: "/ForgetPassword",
    name: "ForgetPassword",
    component: () => import("../views/ForgetPassword.vue"),
  },
  // 404页面
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
  },
];



const adminRoutes = [
  {
    path: "/Admin",
    name: "Admin",
    redirect: "/Admin/Home",
    component: AdminLayout,
    meta: {
      title: "控制台",
      isAdmin: true,
    },
    children: [
      {
        path: "/Admin/Home",
        name: "AdminHome",
        meta: {
          title: "控制台",
          isAdmin: true,
        },
        component: () => import("../views/Admin/Home.vue"),
      },
      {
        path: "/Admin/UserPerson",
        name: "AdminUserPerson",
        meta: {
          title: "账号信息",
          isAdmin: true,
        },
        component: () => import("../views/Admin/UserPerson.vue"),
      },
      {
        path: "/Admin/PasswordEdit",
        name: "PasswordEdit",
        meta: {
          title: "修改密码",
          isAdmin: true,
        },
        component: () => import("../views/Admin/PasswordEdit.vue"),
      },
      {
        path: "/Admin/UserList",
        name: "AdminUserList",
        meta: {
          title: "账号列表",
          isAdmin: true,
        },
        component: () => import("../views/Admin/UserList.vue"),
      },
            
      	 {
            path: "/Admin/CollectRecordList",
            meta: {
                title: "收藏记录",
                isAdmin: true,
            },
            component: () => import("../views/Admin/CollectRecordList.vue")
        },	
 
      	 {
            path: "/Admin/DietRecordList",
            meta: {
                title: "饮食记录",
                isAdmin: true,
            },
            component: () => import("../views/Admin/DietRecordList.vue")
        },	
 
      	 {
            path: "/Admin/FoodList",
            meta: {
                title: "食物",
                isAdmin: true,
            },
            component: () => import("../views/Admin/FoodList.vue")
        },	
 
      	 {
            path: "/Admin/FoodTypeList",
            meta: {
                title: "食物类型",
                isAdmin: true,
            },
            component: () => import("../views/Admin/FoodTypeList.vue")
        },	
 
      	 {
            path: "/Admin/FoodUnitList",
            meta: {
                title: "食物单位",
                isAdmin: true,
            },
            component: () => import("../views/Admin/FoodUnitList.vue")
        },	
 
      	 {
            path: "/Admin/HealthArticleList",
            meta: {
                title: "健康知识",
                isAdmin: true,
            },
            component: () => import("../views/Admin/HealthArticleList.vue")
        },	
 
      	 {
            path: "/Admin/HealthArticleTypeList",
            meta: {
                title: "健康知识分类",
                isAdmin: true,
            },
            component: () => import("../views/Admin/HealthArticleTypeList.vue")
        },	
 
      	 {
            path: "/Admin/HealthIndicatorList",
            meta: {
                title: "健康指标",
                isAdmin: true,
            },
            component: () => import("../views/Admin/HealthIndicatorList.vue")
        },	
 
      	 {
            path: "/Admin/HealthIndicatorRecordList",
            meta: {
                title: "健康指标记录",
                isAdmin: true,
            },
            component: () => import("../views/Admin/HealthIndicatorRecordList.vue")
        },	
 
      	 {
            path: "/Admin/HealthIndicatorTypeList",
            meta: {
                title: "健康指标分类",
                isAdmin: true,
            },
            component: () => import("../views/Admin/HealthIndicatorTypeList.vue")
        },	
 
      	 {
            path: "/Admin/HealthNoticeList",
            meta: {
                title: "健康提醒",
                isAdmin: true,
            },
            component: () => import("../views/Admin/HealthNoticeList.vue")
        },	
 
      	 {
            path: "/Admin/LikeRecordList",
            meta: {
                title: "点赞记录",
                isAdmin: true,
            },
            component: () => import("../views/Admin/LikeRecordList.vue")
        },	
 
      	 {
            path: "/Admin/RecipeList",
            meta: {
                title: "食谱",
                isAdmin: true,
            },
            component: () => import("../views/Admin/RecipeList.vue")
        },
        {
            path: "/Admin/CommunityPostList",
            meta: {
                title: "健康动态管理",
                isAdmin: true,
            },
            component: () => import("../views/Admin/CommunityPostList.vue")
        },
        {
            path: "/Admin/CommunityCommentList",
            meta: {
                title: "评论管理",
                isAdmin: true,
            },
            component: () => import("../views/Admin/CommunityCommentList.vue")
        },
        {
            path: "/Admin/CommunityTagList",
            meta: {
                title: "标签管理",
                isAdmin: true,
            },
            component: () => import("../views/Admin/CommunityTagList.vue")
        },
        {
            path: "/Admin/CommunityReportList",
            meta: {
                title: "举报管理",
                isAdmin: true,
            },
            component: () => import("../views/Admin/CommunityReportList.vue")
        },
        {
            path: "/Admin/CommunityStats",
            meta: {
                title: "社区数据统计",
                isAdmin: true,
            },
            component: () => import("../views/Admin/CommunityStats.vue")
        },
        {
            path: "/Admin/SportList",
            meta: {
                title: "运动项目",
                isAdmin: true,
            },
            component: () => import("../views/Admin/SportList.vue")
        },
        {
            path: "/Admin/SportUnitList",
            meta: {
                title: "运动单位",
                isAdmin: true,
            },
            component: () => import("../views/Admin/SportUnitList.vue")
        },	
        {
            path: "/Admin/FitnessVideoList",
            meta: {
                title: "AI健身视频",
                isAdmin: true,
            },
            component: () => import("../views/Admin/FitnessVideoList.vue")
        },	
 
     	 
 
    ],
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...routes, ...adminRoutes],
});

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  // 开启进度条
  NProgress.start();

  // 获取 store 实例
  const commonStore = useCommonStore();

  // 可以在这里处理路由权限等逻辑
  if (commonStore.Token) {
    //判断是否有用户信息
    if (commonStore.HasUserInfo == false) {
      //获取账号信息
      await commonStore.GetInfo();
      //获取的账号id为空或者为0
      if (commonStore.UserId == null || commonStore.UserId == 0) {
        commonStore.Logout();
      }
    }
    //如果去往的页面是后台
    if (to.meta && to.meta.isAdmin) {
      if (commonStore.RoleType == "管理员") {
        next();
      } else {
        next({ path: "/" });
      }
    } else {
      if (commonStore.RoleType == "管理员") {
        next({ path: "/Admin" });
      } else {
        next();
      }
    }
  } else {
    if (to.meta && to.meta.isAdmin) {
      next({ path: "/Login" });
    } else {
      next();
    }
  }
});

// 路由后置守卫
router.afterEach(() => {
  window.scrollTo({ top: 0 });
  // 关闭进度条
  NProgress.done();
});

export default router;
