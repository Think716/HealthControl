"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_http = require("../../utils/http.js");
const store_index = require("../../store/index.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "CommunityList",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    const UserId = common_vendor.computed(() => commonStore.UserId);
    const posts = common_vendor.ref([]);
    const tags = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const finished = common_vendor.ref(false);
    const commentPopup = common_vendor.ref(null);
    const activePost = common_vendor.ref(null);
    const commentText = common_vendor.ref("");
    const where = common_vendor.reactive({ Tag: "" });
    const likeStatuses = common_vendor.reactive({});
    const collectStatuses = common_vendor.reactive({});
    common_vendor.onShow(async () => {
      page.value = 1;
      finished.value = false;
      await Promise.all([loadTags(), loadPosts(true)]);
    });
    const loadTags = async () => {
      var _a;
      try {
        const res = await utils_http.Post("/CommunityTag/List", { Page: 1, Limit: 50 });
        common_vendor.index.__f__("log", "at pages/Front/CommunityList.vue:135", "加载标签结果:", res);
        if (res.Success) {
          tags.value = ((_a = res == null ? void 0 : res.Data) == null ? void 0 : _a.Items) || [];
        } else {
          common_vendor.index.__f__("error", "at pages/Front/CommunityList.vue:139", "加载标签失败:", res.Msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/CommunityList.vue:142", "加载标签异常:", error);
      }
    };
    const loadPosts = async (reset = false) => {
      var _a;
      if (finished.value && !reset)
        return;
      try {
        const res = await utils_http.Post("/CommunityPost/List", {
          Page: page.value,
          Limit: 10,
          Tag: where.Tag,
          Status: 1
        });
        common_vendor.index.__f__("log", "at pages/Front/CommunityList.vue:155", "加载帖子结果:", res);
        if (res.Success) {
          const items = ((_a = res == null ? void 0 : res.Data) == null ? void 0 : _a.Items) || [];
          items.forEach((item) => {
            if (item.Id != null) {
              likeStatuses[item.Id] = item.Liked || false;
              collectStatuses[item.Id] = item.Collected || false;
            }
          });
          posts.value = reset ? items : posts.value.concat(items);
          finished.value = items.length < 10;
        } else {
          common_vendor.index.__f__("error", "at pages/Front/CommunityList.vue:167", "加载帖子失败:", res.Msg);
          common_vendor.index.showToast({ title: res.Msg || "加载数据失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/CommunityList.vue:171", "加载帖子异常:", error);
        common_vendor.index.showToast({ title: "网络请求失败", icon: "none" });
      }
    };
    const loadMore = async () => {
      if (finished.value)
        return;
      page.value += 1;
      await loadPosts();
    };
    const selectTag = async (tag) => {
      where.Tag = tag;
      page.value = 1;
      finished.value = false;
      await loadPosts(true);
    };
    const splitImages = (value) => value ? value.split(",").filter(Boolean) : [];
    const splitTags = (value) => value ? value.split(",").filter(Boolean) : [];
    const preview = (images, index) => common_vendor.index.previewImage({ urls: splitImages(images), current: index });
    const goBack = () => {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.redirectTo({ url: "/pages/Front/Index" });
      }
    };
    const goPublish = () => common_vendor.index.navigateTo({ url: "/pages/Front/CommunityForm" });
    const toggleLike = async (post) => {
      var _a, _b;
      const res = await utils_http.Post("/CommunityPost/ToggleLike", { UserId: UserId.value, PostId: post.Id });
      const liked = ((_a = res == null ? void 0 : res.Data) == null ? void 0 : _a.Liked) ?? !likeStatuses[post.Id];
      likeStatuses[post.Id] = liked;
      post.LikeCount = ((_b = res == null ? void 0 : res.Data) == null ? void 0 : _b.LikeCount) ?? post.LikeCount;
    };
    const toggleCollect = async (post) => {
      var _a, _b;
      const res = await utils_http.Post("/CommunityPost/ToggleCollect", { UserId: UserId.value, PostId: post.Id });
      const collected = ((_a = res == null ? void 0 : res.Data) == null ? void 0 : _a.Collected) ?? !collectStatuses[post.Id];
      collectStatuses[post.Id] = collected;
      post.CollectCount = ((_b = res == null ? void 0 : res.Data) == null ? void 0 : _b.CollectCount) ?? post.CollectCount;
    };
    const openComment = (post) => {
      activePost.value = post;
      commentText.value = "";
      commentPopup.value.open();
    };
    const submitComment = async () => {
      if (!commentText.value.trim()) {
        common_vendor.index.showToast({ title: "请输入评论内容", icon: "none" });
        return;
      }
      await utils_http.Post("/CommunityPost/Comment", {
        PostId: activePost.value.Id,
        CommentUserId: UserId.value,
        Content: commentText.value
      });
      commentPopup.value.close();
      await loadPosts(true);
    };
    const report = async (post) => {
      const res = await common_vendor.index.showActionSheet({ itemList: ["广告", "违规内容", "恶意信息"] });
      const reasons = ["广告", "违规内容", "恶意信息"];
      await utils_http.Post("/CommunityPost/Report", { PostId: post.Id, ReportUserId: UserId.value, Reason: reasons[res.tapIndex] });
      common_vendor.index.showToast({ title: "已提交举报", icon: "success" });
    };
    const removePost = async (post) => {
      await utils_http.Post("/CommunityPost/Delete", { Id: post.Id });
      posts.value = posts.value.filter((item) => item.Id !== post.Id);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          dark: true,
          fixed: true,
          shadow: true,
          ["background-color"]: "var(--primary-color)",
          ["status-bar"]: true,
          ["left-icon"]: "left",
          ["left-text"]: "返回",
          title: "健康动态社区"
        }),
        c: where.Tag === "" ? 1 : "",
        d: common_vendor.o(($event) => selectTag("")),
        e: common_vendor.f(tags.value, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag.Name),
            b: tag.Id,
            c: where.Tag === "#" + tag.Name ? 1 : "",
            d: common_vendor.o(($event) => selectTag("#" + tag.Name), tag.Id)
          };
        }),
        f: common_vendor.f(posts.value, (post, k0, i0) => {
          var _a, _b, _c;
          return common_vendor.e({
            a: ((_a = post.PublishUserDto) == null ? void 0 : _a.ImageUrls) || common_vendor.unref(common_assets.defaultAvatar),
            b: common_vendor.t(((_b = post.PublishUserDto) == null ? void 0 : _b.Name) || ((_c = post.PublishUserDto) == null ? void 0 : _c.UserName) || "健康用户"),
            c: common_vendor.t(post.CreationTime),
            d: post.AuditStatus === 1
          }, post.AuditStatus === 1 ? {} : {}, {
            e: common_vendor.t(post.PostType || "健康生活记录"),
            f: common_vendor.t(post.Content),
            g: splitImages(post.ImageUrls).length
          }, splitImages(post.ImageUrls).length ? {
            h: common_vendor.f(splitImages(post.ImageUrls), (img, index, i1) => {
              return {
                a: index,
                b: img,
                c: common_vendor.o(($event) => preview(post.ImageUrls, index), index)
              };
            })
          } : {}, {
            i: post.Tags
          }, post.Tags ? {
            j: common_vendor.f(splitTags(post.Tags), (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            })
          } : {}, {
            k: post.AiComment
          }, post.AiComment ? {
            l: common_vendor.t(post.AiComment)
          } : {}, {
            m: common_vendor.t(likeStatuses[post.Id] ? "♥" : "♡"),
            n: likeStatuses[post.Id] ? "#ef4444" : "#999",
            o: common_vendor.t(post.LikeCount || 0),
            p: common_vendor.o(($event) => toggleLike(post), post.Id),
            q: common_vendor.t(collectStatuses[post.Id] ? "★" : "☆"),
            r: collectStatuses[post.Id] ? "#f59e0b" : "#999",
            s: common_vendor.t(post.CollectCount || 0),
            t: common_vendor.o(($event) => toggleCollect(post), post.Id),
            v: "7d7b4010-1-" + i0,
            w: common_vendor.t(post.CommentCount || 0),
            x: common_vendor.o(($event) => openComment(post), post.Id),
            y: common_vendor.o(($event) => report(post), post.Id),
            z: post.PublishUserId === UserId.value
          }, post.PublishUserId === UserId.value ? {
            A: common_vendor.o(($event) => removePost(post), post.Id)
          } : {}, {
            B: post.Comments && post.Comments.length
          }, post.Comments && post.Comments.length ? {
            C: common_vendor.f(post.Comments, (comment, k1, i1) => {
              var _a2, _b2;
              return {
                a: common_vendor.t(((_a2 = comment.CommentUserDto) == null ? void 0 : _a2.Name) || ((_b2 = comment.CommentUserDto) == null ? void 0 : _b2.UserName) || "用户"),
                b: common_vendor.t(comment.Content),
                c: comment.Id
              };
            })
          } : {}, {
            D: post.Id
          });
        }),
        g: common_vendor.p({
          type: "chat",
          size: "18",
          color: "#999"
        }),
        h: !posts.value.length
      }, !posts.value.length ? {
        i: common_vendor.p({
          type: "info",
          size: "48",
          color: "#ccc"
        })
      } : {}, {
        j: common_vendor.o(loadMore),
        k: common_vendor.o(goPublish),
        l: commentText.value,
        m: common_vendor.o(($event) => commentText.value = $event.detail.value),
        n: common_vendor.o(submitComment),
        o: common_vendor.sr(commentPopup, "7d7b4010-3", {
          "k": "commentPopup"
        }),
        p: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7d7b4010"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/CommunityList.js.map
