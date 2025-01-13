<script setup>
const handleSubmit=(empty,baseFile)=>{
  console.log(empty,baseFile);

}
</script>

<template>
  <div>
    <xs-signature :custom="false" @submit="handleSubmit" />
  </div>
</template>

<style scoped></style>
