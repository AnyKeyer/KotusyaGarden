<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['flowers','money'])
const emit = defineEmits(['upgrade-flower', 'buy-flower'])

const clickData = ref({})

function handleUpgradeClick(flower) {
  const upgradeData = { action: 'upgrade', flower }
  emit('upgrade-flower', upgradeData)
}

function handleBuyClick(flower, quantity) {
  let finalPrice = flower.sellPrice * 0.5 * quantity
  if (props.money < finalPrice) {
    return;
  }
  const flowerId = flower.id
  const buyData = { action: 'buy', flower, quantity }
  clickData.value[flowerId] = !clickData.value[flowerId]
    ? quantity
    : clickData.value[flowerId] + quantity
  emit('buy-flower', buyData)
}

const hasClickData = computed(() => {
  return (flowerId) => clickData.value && clickData.value.hasOwnProperty(flowerId)
})
</script>

<template>
  <div class="shelves-wrapper">
    <div class="stuffonshelf">
      <div class="wrapper" v-for="flower in props.flowers" :key="flower.id">
        <div class="wrapper-count">
          <div class="count">
            <div>Склад {{ flower.count }}</div>
            <div>{{ flower.upgradeLevel * flower.upgradeMultiplier }}/day</div>
          </div>
          <div class="flower-name">{{ flower.name }}</div>
          <div class="tooltip">
          <img class="example" :src="`flowers/${flower.imageName}.png`" />
          <span class="tooltip-text">{{ flower.categories.join(" ")}}</span>
          </div>
        </div>
        <div class="controls">
          <div class="upgrade">
            <div>{{ flower.sellPrice * flower.upgradeMultiplier * 7 }}</div>
            <button class="button-87" role="button" @click.left.exact="handleUpgradeClick(flower)">
              Улучшить
            </button>
          </div>
          <div class="buy">
            <button
              class="button-87"
              role="button"
              @click.left.exact="handleBuyClick(flower, 5)"
              @click.right.exact.prevent="handleBuyClick(flower, 15)"
              @click.middle.exact.prevent="handleBuyClick(flower, 50)"
            >
              Купить
            </button>
            <div class="price">{{ flower.sellPrice * 0.5 }}</div>
            <div class="buy-count" v-if="hasClickData(flower.id)">
              {{ clickData[`${flower.id}`] }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <img class="shelf" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: row;
  gap: 5px;
  .price {
    border-radius: 15px;
  }
  .buy-count {
    padding: 0;
    font-size: 15px !important;
    background-color: #51ad2d !important;
    border-radius: 10px;
  }
  .flower-name {
    background-color: #51ad2d !important;
    text-align: center;
    font-family: 'Pacifico', cursive;
    font-size: 20px;
    color: rgb(201, 223, 202);
  }
}
.wrapper-count {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.count {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
  font-family: 'Pacifico', cursive;
  font-size: 25px;
  font-weight: bold;
  color: #EE4266;
  div:first-child{
    background-color:#FFD23F;
  }
  div:last-child{
    background-color: #FFD23F;
  }
}
.controls {
  display: flex;
  font-family: 'Pacifico', cursive;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .upgrade,
  .buy {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 50%;
    div {
      font-size: 30px;
      text-align: center;
      color: green;
      background-color: rgb(87, 212, 70);
    }
  }
  .upgrade {
    .button-87 {
      margin-top: 0px !important;
    }
    div:first-child{
      border-radius: 15px;
    }
  }
  .buy {
    .button-87 {
      margin-bottom: 0px !important;
    }
  }
}

.button-87 {
  margin: 10px;
  padding: 15px 30px;
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
  border-radius: 10px;
  display: block;
  border: 0px;
  font-weight: 700;
  box-shadow: 0px 0px 14px -7px #f09819;
  background-image: linear-gradient(45deg, #ff512f 0%, #f09819 51%, #ff512f 100%);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-87:hover {
  background-position: right center;
  /* change the direction of the change here */
  color: #fff;
  text-decoration: none;
}

.button-87:active {
  transform: scale(0.95);
}
</style>
