import XsSignature from "@/components/XsSignature.vue"; // 引入封装好的组件

const components = [XsSignature];
const install = function (App, options) {
  components.forEach((component) => {
    // 这个name是你创建组件的时候要填写好的
    App.component(component.name, component);
  });
};
export default { install };
