<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { sliceBase64Image, rotateBase64Image } from "../utils";

/**
 * 传递接受的值
 * @param  overlayText 自定义页面主体提示语
 * @param  horizontalScreenText 自定义翻转提示语
 * @param  title 自定义标题
 * @param  showHeader 是否展示头部
 * @param  showFooter 是否展示底部
 * @param  custom 是否开启自定义模式(依旧保留头部、底部，不同于为可以自定义其中内容) 默认 'false'
 * @param  colorList 字体可选颜色集合 默认 '黑色' '红色' '蓝色'  ([{id:Number:xxx,text:String:xxx,value:String:xxx}])
 * @param  boldList 字体可选粗细集合 默认 '3' '6' '9'  ([{id:Number:xxx,text:String:xxx,value:String:xxx}])
 */
const props = defineProps({
  overlayText: {
    type: String,
    default: "请在此处绘制",
  },
  horizontalScreenText: {
    type: String,
    default: "为了您的使用体验，请将手机横屏完成绘制",
  },
  title: {
    type: String,
    default: "签署采集",
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  custom: {
    type: Boolean,
    default: false,
  },
  colorList: {
    type: Array,
    default: [
      { id: 1, text: "黑色", value: "rgba(44, 44, 44, 1)" },
      { id: 2, text: "红色", value: "rgba(209, 26, 48, 1)" },
      { id: 3, text: "蓝色", value: "rgba(0, 142, 224, 1)" },
    ],
  },
  boldList: {
    type: Array,
    default: [
      { id: 1, text: "细", value: 3 },
      { id: 2, text: "中等", value: 6 },
      { id: 3, text: "粗", value: 9 },
    ],
  },
});

/**
 * 传递出去的方法
 * @param close 回退一步的操作
 * @param reset 清空页面所绘制签名操作
 * @param submit 提交获取签名Base64  'empty':签名是否为空值 'baseFile':签名后裁切的Base64文件 'orientation':屏幕翻转方向
 */
const emit = defineEmits(["close", "reset", "submit"]);

const showOverlay = ref(true);
const isColorChange = ref(false);
const isBoldChange = ref(false);
const selectedColor = ref(null);
const selectedBold = ref(null);
const selectedColorValue = ref("#000");
const selectedBoldValue = ref(3);
const options = ref({
  penColor: "#000", //设置默认颜色
  maxWidth: 3, //设置默认粗细
  //开始绘画
  onBegin: () => {
    // 用户开始签名时，隐藏Overlay层
    showOverlay.value = false;
    isColorChange.value = false;
    isBoldChange.value = false;
  },
});

const isVertica = computed(() => {
  return window.innerWidth > window.innerHeight;
});

/**
 * 监听屏幕转向
 */
const handleOrientationChange = () => {
  // 获取当前设备方向信息
  const currentOrientation = window.screen.orientation.type;
  // 根据设备方向执行不同的操作
  switch (currentOrientation) {
    case "portrait-primary":

    case "portrait-secondary":
      // 竖屏
      // 执行竖屏相关操作
      window.location.reload();
      console.log("这是竖屏");
      // isVertica.value = true;
      break;

    case "landscape-primary":

    case "landscape-secondary":
      // 横屏
      // 执行横屏相关操作
      console.log("这是横屏");
      window.location.reload();
      break;
  }
};

/**
 * 返回上一步
 */
const toSign = () => {
  emit("close");
};

/**
 * 切换字体颜色
 */
const toggleColorIcon = (item) => {
  selectedColor.value = item.id;
  selectedColorValue.value = item.value;
  handleReset();
  options.value.penColor = item.value;
};

/**
 * 切换字体粗细
 */
const toggleBoldIcon = (item) => {
  selectedBold.value = item.id;
  selectedBoldValue.value = item.value * 2 + 6;
  handleReset();
  options.value.maxWidth = item.value;
};

/**
 * 显示改变笔迹颜色
 */
const showColor = () => {
  isColorChange.value = !isColorChange.value;
};

/**
 * 显示改变笔记粗细
 */
const showBold = () => {
  isBoldChange.value = !isBoldChange.value;
};

/**
 * 开始签名关闭蒙层
 */
const hideOverlay = () => {
  // 用户点击Overlay层时，隐藏它
  showOverlay.value = false;
  isColorChange.value = false;
  isBoldChange.value = false;
};

const vueSignatureRef = ref(null);
/**
 * 清空画板
 */
const handleReset = () => {
  vueSignatureRef.value.clearSignature();
  // 用户点击清空按钮时，显示Overlay层
  showOverlay.value = true;
  isColorChange.value = false;
  isBoldChange.value = false;
  emit("reset");
};

const baseFile = ref("");
/**
 * 提交
 */
const handleGenerate = () => {
  const { isEmpty, data } = vueSignatureRef.value.saveSignature();
  const orientation = window.orientation;
  sliceBase64Image(data).then((slicedImages) => {
    rotateBase64Image(slicedImages, 270).then((img) => {
      baseFile.value = img;
    });
  });
  emit("submit", isEmpty, baseFile.value, orientation);
};

onMounted(() => {
  window.addEventListener("orientationchange", handleOrientationChange);
});

onBeforeUnmount(() => {
  window.removeEventListener("orientationchange", handleOrientationChange);
});
</script>

<template>
  <section class="app-container" @touchmove.prevent>
    <div v-if="isVertica" class="isvertica">
      <div>
        <img
          alt="horizontalScreen"
          class="simg"
          src="../public/images/horizontalScreen.png"
        />
        <div>{{ horizontalScreenText }}</div>
      </div>
    </div>
    <!-- 页面具体内容 -->
    <div v-else class="xs-main">
      <div class="header" v-if="showHeader">
        <div class="h-l" @click="toSign" v-if="!custom">
          <div>
            <img
              style="height: 20px; margin-right: 4px"
              src="../public/images/back.png"
              alt="back"
            />
          </div>
          <div>返回</div>
        </div>
        <div class="h-t" v-if="!custom">{{ title }}</div>
        <slot name="xs-header"></slot>
      </div>
      <div id="main">
        <!-- 绘画板-->
        <VueSignaturePad
          :key="options.penColor + options.maxWidth"
          ref="vueSignatureRef"
          :options="options"
          style="transform: rotate(-90deg); height: 100vmax"
        />
        <!-- Overlay层 -->
        <div v-show="showOverlay" class="overlay" @touchenter="hideOverlay">
          <div>{{ overlayText }}</div>
        </div>
      </div>
      <div class="footer" v-if="showFooter">
        <div style="display: flex" v-if="!custom">
          <!-- 底部筛选字体颜色区 -->
          <div class="f-m">
            <div class="f-w">笔迹颜色</div>
            <div :style="{ background: selectedColorValue }" class="f-l"></div>
            <div class="logo" @click="showColor">
              <img alt="logo" src="../public/images/s-change2.png" />
            </div>
            <div v-if="isColorChange" class="color">
              <div
                v-for="item in colorList"
                :key="item.id"
                :style="{ background: `${item.value}` }"
                class="c-item"
                @click="toggleColorIcon(item)"
              >
                {{ item.text }}
                <div
                  v-if="
                    selectedColor === item.id ||
                    (!selectedColor && item.id === 1)
                  "
                  class="c-icon"
                >
                  <img alt="selected" src="../public/images/s-select2.png" />
                </div>
              </div>
            </div>
          </div>
          <div class="f-m">
            <div class="f-w">笔迹粗细</div>
            <div
              :style="{
                height: `${selectedBoldValue}px`,
                background: selectedColorValue,
              }"
              class="f-r"
            ></div>
            <div class="logo" @click="showBold">
              <img alt="logo" src="../public/images/s-change2.png" />
            </div>
            <div v-if="isBoldChange" class="color">
              <div
                v-for="item in boldList"
                :key="item.id"
                :style="{
                  height: `${item.value * 2 + 6}px`,
                  background: selectedColorValue,
                }"
                class="c-item bold"
                @click="toggleBoldIcon(item)"
              >
                {{ item.text }}
                <div
                  v-if="
                    selectedBold === item.id || (!selectedBold && item.id === 1)
                  "
                  class="c-icon"
                >
                  <img alt="selected" src="../public/images/s-select2.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="f-b" v-if="!custom">
          <button class="f-b-c" @click="handleReset">清空</button>
          <button class="f-b-s" @click="handleGenerate">确定</button>
        </div>
        <slot name="xs-footer"></slot>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.app-container {
  width: 100vmax;
  height: 100vmin;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 8px 20px;
  @media screen and (orientation: portrait) {
    position: absolute;
    width: 100vh;
    height: 100vw;
    top: 0;
    left: 100vw;
    -webkit-transform: rotate(90deg);
    -moz-transform: rotate(90deg);
    -ms-transform: rotate(90deg);
    transform: rotate(90deg);
    transform-origin: 0% 0%;
  }

  @media screen and (orientation: landscape) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
  .isvertica {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
  }
  .simg {
    height: 128px;
    margin: 20px auto;
  }
  .xs-main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .header {
    width: 100%;
    height: 25px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    z-index: 10;

    .h-l {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #008ee0;
    }

    .h-t {
      flex: 1;
      height: 25px;
      font-size: 18px;
      font-family: "AlibabaPuHuiTi_2_65_Medium", serif;
      color: #000000;
      text-align: center;
    }
  }

  #main {
    flex: 1;
    overflow: hidden;
    border-top: 1px solid #f3f5f5;
    border-bottom: 1px solid #f3f5f5;
    position: relative;

    .overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 50px;
      font-family: "AlibabaPuHuiTi_2_55_Regular", serif;
      color: #dedfe7;
      line-height: 70px;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 40px; /* 旋转后的高度 */
    z-index: 99;

    .f-m {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-right: 24px;
      position: relative;
    }

    .f-w {
      width: 56px;
      height: 20px;
      font-size: 14px;
      font-family: "AlibabaPuHuiTi_2_55_Regular", serif;
      color: #5d5d5d;
      line-height: 20px;
    }

    .f-l {
      width: 64px;
      height: 28px;
      background: #2c2c2c;
      border-radius: 4px;
      margin: 0 4px;
    }

    .f-r {
      width: 64px;
      height: 4px;
      background: #2c2c2c;
      margin: 0 4px;
    }

    .f-b {
      margin-right: 60px;

      .f-b-c {
        width: 64px;
        height: 32px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
      }

      .f-b-c:active {
        transform: scale(0.98);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      }

      .f-b-s {
        width: 64px;
        height: 32px;
        background: #008ee0;
        border-radius: 4px;
        margin-left: 12px;
        color: #ffffff;
        transition: all 0.2s ease;
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
      }

      .f-b-s:active {
        transform: scale(0.98);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.logo {
  margin-left: 2px;
  width: 28px;
  height: 26px;
  background: rgba(#fff, 0.8);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 11px;
    height: 10px;
    display: block;
  }
}
.logo:active {
  transform: scale(0.95);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.color {
  width: 115px;
  height: 102px;
  padding: 14px 19px 0 19px;
  background: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06);
  border-radius: 2px;
  border: 1px solid rgba(242, 243, 245, 0.6);
  position: absolute;
  top: -110px;
  left: 30px;
  .c-item {
    width: 100%;
    height: 27%;
    border-radius: 4px;
    margin-bottom: 3px;
    font-size: 10px;
    font-family: "AlibabaPuHuiTi_2_55_Regular", serif;
    color: #ffffff;
    line-height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;

    .c-icon {
      width: 9px;
      height: 10px;
      margin-left: 5px;
    }

    img {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .bold {
    margin-bottom: 10px;
  }
}

.color-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
}

.color-option.selected {
  border: 2px solid #000;
}
</style>
