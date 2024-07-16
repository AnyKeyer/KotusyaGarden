<script setup>
import { useRouter } from 'vue-router'
import Shelve from '../components/Shelve.vue'
import useCookie from '../saveCookie'
import { computed, onMounted, provide, ref, watch } from 'vue'

const router = useRouter()
const { localData } = useCookie()

const currentIndex = ref(0)
const unlockFlowerAnim = ref(false)
const currentUnlocableFlower = ref({})
const isUnlocableFlowersAvailable = ref(false)

const chunkArray = (array, chunkSize = 3) => {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

const chunkedArray24 = computed(() =>
  chunkArray(localData.value?.flowers?.filter((el) => el.isOpen == true) || [], 8)
)
const currentChunk = computed(() => chunkedArray24.value[currentIndex.value])
const paginatedChunks = computed(() => chunkArray(currentChunk.value || [], 4))
const isFlowerUnlocable = computed(
  () =>
    localData.value?.money >= +localData.value.unlockPrice && localData.value?.experience >= 1500
)

const nextPage = () => {
  currentIndex.value = (currentIndex.value + 1) % chunkedArray24.value.length
}

const prevPage = () => {
  currentIndex.value =
    (currentIndex.value - 1 + chunkedArray24.value.length) % chunkedArray24.value.length
}

watch(localData, () => {
  if (localData.value?.flowers) {
    isUnlocableFlowersAvailable.value = !!localData.value.flowers.find((el) => el.isOpen == false)
  }
})

function stairs() {
  var audio = new Audio(`./../../public/Sounds/toptoptop.mp3`)
  audio.play()
  router.push('/')
}

function unlockFlower() {
  var audio = new Audio(`./../../public/Sounds/achievement.mp3`)
  audio.play()
  localData.value.money -= localData.value.unlockPrice
  localData.value.experience -= 1500
  localData.value.unlockPrice = +localData.value.unlockPrice + 1000
  const flower = getRandomClosedItem(localData.value.flowers)
  if (flower == null) {
    isUnlocableFlowersAvailable.value = false
    return
  }
  flower.isOpen = true
  currentUnlocableFlower.value = flower
  unlockFlowerAnim.value = true
  setTimeout(() => {
    unlockFlowerAnim.value = false
  }, 3000)
}

function getRandomClosedItem(array) {
  const closedItems = array.filter((item) => item.isOpen === false)
  if (closedItems.length === 0) {
    return null
  }
  const randomIndex = Math.floor(Math.random() * closedItems.length)
  return closedItems[randomIndex]
}

onMounted(() => {
  if (localData.value?.flowers) {
    isUnlocableFlowersAvailable.value = !!localData.value.flowers.find((el) => el.isOpen == false)
  }
  provide('bucket', localData.value.flowersQueue)
})

function buyFlowers({ flower, quantity }) {
  let finalPrice = flower.sellPrice * 0.5 * quantity
  if (localData.value.money >= finalPrice) {
    const buyedFlower = localData.value.flowers.find((el) => el.id == flower.id)
    localData.value.flowersQueue.push({ id: buyedFlower.id, quantityFL: quantity })
    localData.value.money -= finalPrice.toFixed(2);
  }
}
function buyUpgrade({ flower }) {
  let finalPrice = flower.sellPrice * flower.upgradeMultiplier * 7
  if (localData.value.money >= flower.upgradeMultiplier * 7) {
    const buyedFlower = localData.value.flowers.find((el) => el.id == flower.id)
    buyedFlower.upgradeLevel += 1
    localData.value.money -= finalPrice.toFixed(2);
  }
}
</script>

<template>
  <div class="unlock" v-if="unlockFlowerAnim">
    <img
      :src="`../../public/flowers/${currentUnlocableFlower.imageName}.png`"
      class="animate__animated animate__bounceInLeft"
      alt=""
    />
    <img
      class="sparkle animate__animated animate__rotateIn"
      src="../../public/images/sparkle.png"
      alt=""
    />
    <div class="name animate__animated animate__backInUp">{{ currentUnlocableFlower.name }}</div>
  </div>
  <img
    src="../../public/images/lucky.png"
    class="unlock-button-flower"
    v-if="isFlowerUnlocable && isUnlocableFlowersAvailable"
    @click="unlockFlower"
  />
  <div class="main">
    <div class="stats-info">
      <div class="money">
        <div class="value" v-if="localData.money">{{ localData.money }}</div>
        <div class="text left-radius">Kotusya coin</div>
      </div>
      <div class="experience">
        <div class="value" v-if="localData.experience">{{ localData.experience }}</div>
        <div class="text">Опыт</div>
      </div>
      <div class="day">
        <div class="value">{{ localData.day }}</div>
        <div class="text right-radius">День</div>
      </div>
    </div>
    <div class="shelves">
      <template v-for="chunk in paginatedChunks" :key="chunk[0]?.id">
        <Shelve @buy-flower="buyFlowers" @upgrade-flower="buyUpgrade" :flowers="chunk" :money="localData.money"></Shelve>
      </template>
    </div>
    <div class="controls" v-if="chunkedArray24?.length > 1">
      <button class="button-1" @click="prevPage">Previous</button>
      <button class="button-1" @click="nextPage">Next</button>
    </div>
    <div class="staris" @click="stairs"></div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  position: relative;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url('../../public/images/storage.png');
  background-repeat: no-repeat;
  background-size: cover;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-columns: 1fr 10%;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}
.stats-info {
  position: absolute;
  display: flex;
  right: 10px;
  top: 0;
  text-align: center;
  font-family: 'Pacifico', cursive;
  font-size: 30px;
  .text {
    padding: 5px 5px;
    background-color: #4caf4fd5;
    color: #ffffff;
    font-size: 20px;
  }
  .value {
    padding: 5px 15px;
    background-color: #ffc107de;
    color: #000000;
  }
  .left-radius {
    border-bottom-left-radius: 15px;
  }
  .right-radius {
    border-bottom-right-radius: 15px;
  }
}
.unlock {
  position: fixed; /* Используем fixed для центрирования относительно окна браузера */
  top: 50%; /* Располагаем верхний край блока на 50% высоты экрана */
  left: 50%; /* Располагаем левый край блока на 50% ширины экрана */
  transform: translate(
    -50%,
    -50%
  ); /* Смещаем блок на половину своей ширины и высоты назад, чтобы центрировать его */
  display: flex;
  width: 50vw;
  height: 50vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99;
  .sparkle {
    position: absolute;
    z-index: -1;
  }
  .name {
    font-size: 150px;
    font-family: 'Pacifico', cursive;
    color: rgb(111, 216, 235);
  }
}
.unlock-button-flower {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 150px;
  height: 125px;
  z-index: 10;
}
.shelves {
  grid-area: 1 / 1 / 2 / 2;
  display: grid;
  grid-template-columns: 1fr;
  padding: 50px;
}
.staris {
  grid-area: 1 / 2 / 2 / 3;
  cursor:
    url('./../../public/images/cursor/active.png') 16 16,
    auto;
}
.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

/* CSS */
.button-1 {
  background-color: #ea4c89;
  border-radius: 8px;
  border-style: none;
  box-sizing: border-box;
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: 'Haas Grot Text R Web', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  height: 40px;
  line-height: 20px;
  list-style: none;
  margin: 0;
  outline: none;
  padding: 10px 16px;
  position: relative;
  text-align: center;
  text-decoration: none;
  transition: color 100ms;
  vertical-align: baseline;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-1:hover,
.button-1:focus {
  background-color: #f082ac;
}
</style>
