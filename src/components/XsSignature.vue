<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount} from "vue";
import {sliceBase64Image, rotateBase64Image} from "./utils";

// Constants
const DEFAULT_COLORS = [
  {id: 1, text: "黑色", value: "rgba(44, 44, 44, 1)"},
  {id: 2, text: "红色", value: "rgba(209, 26, 48, 1)"},
  {id: 3, text: "蓝色", value: "rgba(0, 142, 224, 1)"},
];

const DEFAULT_BOLD_OPTIONS = [
  {id: 1, text: "细", value: 3},
  {id: 2, text: "中等", value: 6},
  {id: 3, text: "粗", value: 9},
];

// Component Options
defineOptions({
  name: "XsSignature",
});

// Props
interface SignatureOption {
  id: number;
  text: string;
  value: string | number;
}

/**
 * 传递接受的值
 * @param  overlayText 自定义页面主体提示语
 * @param  horizontalScreenText 自定义翻转提示语
 * @param  title 自定义标题
 * @param  showHeader 是否展示头部
 * @param  showFooter 是否展示底部
 * @param  custom 是否开启自定义模式(依旧保留头部、底部，不同于为可以自定义其中内容) 默认 'true'
 * @param  colorList 字体可选颜色集合 默认 '黑色' '红色' '蓝色'  ([{id:Number:xxx,text:String:xxx,value:String:xxx}])
 * @param  boldList 字体可选粗细集合 默认 '3' '6' '9'  ([{id:Number:xxx,text:String:xxx,value:String:xxx}])
 */
const props = withDefaults(defineProps<{
  overlayText?: string;
  horizontalScreenText?: string;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  custom?: boolean;
  colorList?: SignatureOption[];
  boldList?: SignatureOption[];
}>(), {
  overlayText: "请在此处绘制",
  horizontalScreenText: "为了您的使用体验，请将手机横屏完成绘制",
  title: "签署采集",
  showHeader: true,
  showFooter: true,
  custom: true,
  colorList: () => [
    {id: 1, text: "黑色", value: "rgba(44, 44, 44, 1)"},
    {id: 2, text: "红色", value: "rgba(209, 26, 48, 1)"},
    {id: 3, text: "蓝色", value: "rgba(0, 142, 224, 1)"},
  ],
  boldList: () => [
    {id: 1, text: "细", value: 3},
    {id: 2, text: "中等", value: 6},
    {id: 3, text: "粗", value: 9},
  ],
});

/**
 * 传递出去的方法
 * @param reset 清空页面所绘制签名操作
 * @param submit 提交获取签名Base64  'empty':签名是否为空值 'baseFile':签名后裁切的Base64文件 'orientation':屏幕翻转方向
 */
const emit = defineEmits<{
  (e: "reset"): void;
  (e: "submit", isEmpty: boolean, baseFile: string, orientation: number): void;
}>();

// Refs
const showOverlay = ref(true);
const isColorChange = ref(false);
const isBoldChange = ref(false);
const selectedColor = ref<number | null>(null);
const selectedBold = ref<number | null>(null);
const selectedColorValue = ref(DEFAULT_COLORS[0].value);
const selectedBoldValue = ref(DEFAULT_BOLD_OPTIONS[0].value);
const vueSignatureRef = ref<any>(null);

// Computed
const isVertica = computed(() => window.innerWidth > window.innerHeight);

// Signature Options
const signatureOptions = ref({
  penColor: DEFAULT_COLORS[0].value,
  maxWidth: DEFAULT_BOLD_OPTIONS[0].value,
  onBegin: () => {
    showOverlay.value = false;
    isColorChange.value = false;
    isBoldChange.value = false;
  },
});

// Methods
const handleOrientationChange = () => {
  window.location.reload();
};


const toggleColorIcon = (item: SignatureOption) => {
  selectedColor.value = item.id;
  selectedColorValue.value = item.value as string;
  handleReset();
  signatureOptions.value.penColor = item.value as string;
};

const toggleBoldIcon = (item: SignatureOption) => {
  selectedBold.value = item.id;
  selectedBoldValue.value = (item.value as number) * 2 + 6;
  handleReset();
  signatureOptions.value.maxWidth = item.value as number;
};

const showColor = () => {
  isColorChange.value = !isColorChange.value;
  isBoldChange.value = false;
};

const showBold = () => {
  isBoldChange.value = !isBoldChange.value;
  isColorChange.value = false;
};

const hideOverlay = () => {
  showOverlay.value = false;
  isColorChange.value = false;
  isBoldChange.value = false;
};

const handleReset = () => {
  vueSignatureRef.value?.clearSignature();
  showOverlay.value = true;
  isColorChange.value = false;
  isBoldChange.value = false;
  emit("reset");
};

const handleGenerate = async () => {
  if (!vueSignatureRef.value) return;

  const {isEmpty, data} = vueSignatureRef.value.saveSignature();
  const orientation = window.screen.orientation as any;
  try {
    const slicedImage = await sliceBase64Image(data) as string;
    const rotatedImage = await rotateBase64Image(slicedImage, 270) as string;
    emit("submit", isEmpty, rotatedImage, orientation);
  } catch (error) {
    console.error("Error processing signature:", error);
    emit("submit", isEmpty, "", orientation);
  }
};

// Lifecycle Hooks
onMounted(() => {
  window.addEventListener("orientationchange", handleOrientationChange, {passive: true});
});

onBeforeUnmount(() => {
  window.removeEventListener("orientationchange", handleOrientationChange);
});
</script>
<template>
  <section class="app-container" @touchmove.prevent>
    <div v-if="isVertica" class="isVertica">
      <div class="tips">
        <img
            alt="horizontalScreen"
            class="sImg"
            src="@/assets/images/horizontalScreen.png"
        />
        <div>{{ horizontalScreenText }}</div>
      </div>
    </div>
    <!-- 页面具体内容 -->
    <div v-else class="xs-main">
      <div class="header" v-if="showHeader">
        <div class="h-t" v-if="!custom">{{ title }}</div>
        <slot name="xs-header"></slot>
      </div>
      <div id="main">
        <!-- 绘画板-->
        <VueSignaturePad
            ref="vueSignatureRef"
            :options="signatureOptions"
            :key="signatureOptions.penColor + '-' + signatureOptions.maxWidth"
            style="transform: rotate(-90deg); height: 100vmax"
        />
        <!-- Overlay层 -->
        <div
            v-show="showOverlay"
            class="overlay"
            @touchenter.passive="hideOverlay"
        >
          <div>{{ overlayText }}</div>
        </div>
      </div>
      <div class="footer" v-if="showFooter">
        <div style="display: flex" v-if="!custom">
          <!-- 底部筛选字体颜色区 -->
          <div class="f-m">
            <div class="f-w">笔迹颜色:</div>
            <div :style="{ background: selectedColorValue }" class="f-l"></div>
            <div class="logo" @click="showColor">
              <img alt="logo" src="@/assets/images/s-change2.png"/>
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
                  <img alt="selected" src="@/assets/images/s-select2.png"/>
                </div>
              </div>
            </div>
          </div>
          <div class="f-m">
            <div class="f-w">笔迹粗细:</div>
            <div
                :style="{
                height: `${selectedBoldValue}px`,
                background: selectedColorValue,
              }"
                class="f-r"
            ></div>
            <div class="logo" @click="showBold">
              <img alt="logo" src="@/assets/images/s-change2.png"/>
            </div>
            <div v-if="isBoldChange" class="color">
              <div
                  v-for="item in boldList"
                  :key="item.id"
                  :style="{
                  height: `${item.value as number * 2 + 6}px`,
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
                  <img alt="selected" src="@/assets/images/s-select2.png"/>
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
  padding: 12px;
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
    transform-origin: 0 0;
  }

  @media screen and (orientation: landscape) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  .tips {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .isVertica {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
    color: #000000;
  }

  .sImg {
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
    line-height: 25px;

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
    margin-bottom: 16px;

    .f-m {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-right: 24px;
      position: relative;
    }

    .f-w {
      width: 64px;
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
        transition: all 0.2s ease;
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        font-size: 14px;
        border: none;
        color: #000;
      }

      .f-b-c:hover {
        transform: scale(1.05); /* 悬停放大效果 */
      }

      .f-b-c:active {
        transform: scale(0.95); /* 点击缩小效果 */
      }

      .f-b-c:focus {
        outline: none;
      }

      .f-b-s {
        width: 64px;
        height: 32px;
        background: #008ee0;
        border-radius: 4px;
        margin-left: 16px;
        color: #ffffff;
        transition: all 0.2s ease;
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        font-size: 14px;
        border: none;
      }

      .f-b-s:hover {
        transform: scale(1.05); /* 悬停放大效果 */
      }

      .f-b-s:active {
        background-color: rgba($color: #008ee0, $alpha: 0.8); /* 点击背景色 */
        transform: scale(0.95); /* 点击缩小效果 */
      }

      .f-b-s:focus {
        outline: none;
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

