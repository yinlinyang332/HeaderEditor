<template>
  <div class="form-group">
    <div class="left">
      <slot name="left"></slot>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.form-group {
  height: 70px;
  line-height: 70px;
  box-sizing: border-box;
  > * {
    font-size: 16px;
    display: inline-block;
    vertical-align: middle;
  }

  .left {
    width: 10%;
    min-width: 160px;
  }

  .right {
    width: 89%;
    max-width: calc(100% - 190px);

    .mdl-radio {
      margin-right: 10px;
    }
  }
}
</style>