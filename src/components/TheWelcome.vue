<script setup>
import { useRouter } from 'vue-router'
import BucketFlower from './BucketFlower.vue'
import useCookie from '../saveCookie'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import useDialogs from '../dialogues'
const router = useRouter()

const { localData, updateLocalAndServer} = useCookie()
const { dialogData, getDialogs } = useDialogs()
const isBucketOpen = ref(false)

onMounted(() => {
  console.log(dialogData.value);
})

onBeforeUnmount(updateLocalAndServer);

const gooseSounds = ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3']
function baloons() {
  var audio = new Audio('./../../public/Sounds/baloon.mp3')
  audio.play()
}
function flowerBucket() {
  var audio = new Audio('./../../public/Sounds/shurshanie.mp3')
  audio.play()
  isBucketOpen.value = !isBucketOpen.value
}
function kassa() {
  var audio = new Audio('./../../public/Sounds/kassa.mp3')
  audio.play()
}
function ring() {
  var audio = new Audio('./../../public/Sounds/ring.mp3')
  audio.play();
  if(dialogData.value.length == 0){
    localStorage.removeItem('dialogs');
    nextDayFlowerIncome();
    getDialogs(10);
  }
}
function goose() {
  var audio = new Audio(`./../../public/Sounds/goose/${getRandomSound()}`)
  audio.play()
}
function arrow() {
  var audio = new Audio(`./../../public/Sounds/toptoptop.mp3`)
  audio.play();
  router.push('about');
}
function getRandomSound() {
  const randomIndex = Math.floor(Math.random() * gooseSounds.length)
  return gooseSounds[randomIndex]
}

const currentCustomer = computed(() => {
  return dialogData.value[0]
})

function skipCustomer(){
  dialogData.value.shift();
  isBucketOpen.value = false;
}

function nextDayFlowerIncome(){
  localData.value.flowers.forEach(element => {
    element.count += element.upgradeMultiplier * element.upgradeLevel;
    localData.value.flowersQueue.forEach(el=>{
      if(el.id == element.id){
        element.count += el.quantityFL;
      }
    });
  });
  localData.value.flowersQueue = [];
  localData.value.day+=1;
}

function calculateBoquete(pickedFlowers, requestCategories=currentCustomer.value.categories) {
    let totalPrice = 0;
    let categoryCounts = {};
    let experience = 100;
    // Подсчет общей суммы с учетом условий
    const pickedFlowerFiltered = [];
    for (const picked of pickedFlowers) {
      localData.value.flowers.forEach((element)=>{
        if(picked[0] == element.name){
          pickedFlowerFiltered.push([element,picked[1]]);
        }
      });
    }
    pickedFlowerFiltered.forEach(flower => {
        if (requestCategories.includes(flower[0].category)) {
            totalPrice += flower[0].sellPrice * flower[1];
        } else {
            totalPrice += flower[0].sellPrice * flower[1] * 0.75;
        }


        // снять со счета цветы
          flower[0].count -= flower[1];

        // Подсчет количества цветов по категориям
        if (categoryCounts[flower[0].category]) {
            categoryCounts[flower[0].category]++;
        } else {
            categoryCounts[flower[0].category] = 1;
        }
    });

    // Ограничение общей суммы
    const maxBudget = currentCustomer.value.budget * 1.15;
    if (totalPrice > maxBudget) {
        totalPrice = maxBudget;
    }

    // Вычисление опыта
    requestCategories.forEach(category => {
        if (!categoryCounts[category]) {
            experience -= 25;
        }
    });

    // Уменьшение опыта при недоборе по бюджету
    const shortfallPercentage = ((currentCustomer.value.budget - totalPrice) / currentCustomer.value.budget) * 100;
    if (shortfallPercentage > 25) {
        experience -= shortfallPercentage - 25;
    }

    // Опыт не может быть отрицательным
    if (experience < 0) {
        experience = 0;
    }

    localData.value.money = (+localData.value.money + +totalPrice.toFixed(2)).toFixed(2);
    localData.value.experience = (+localData.value.experience + +experience.toFixed(0)).toFixed(0);

    skipCustomer();
}
</script>

<template>
  <div class="main">
    <div class="stats-info">
      <div class="money">
        <div class="value" v-if="localData.money">{{ localData.money }}</div>
        <div class="text left-radius">Kotusya coin</div>
      </div>
      <div class="experience">
        <div class="value" v-if="localData.experience">{{ localData.experience}}</div>
        <div class="text">Опыт</div>
      </div>
      <div class="day">
        <div class="value">{{ localData.day }}</div>
        <div class="text right-status">День</div>
      </div>
    </div>
    <div class="ballons" @click="baloons"></div>
    <div class="flower-bucket" @click="flowerBucket">
      <template v-if="localData.flowers && currentCustomer">
        <BucketFlower
          v-if="isBucketOpen"
          :flowers="localData.flowers.filter((e) => e.isOpen)"
          :request-categories="currentCustomer.categories"
          :budget="currentCustomer.budget"
          @skip-customer="skipCustomer"
          @make-bouket="calculateBoquete"
        ></BucketFlower>
      </template>
    </div>
    <div class="cash" @click="kassa"></div>
    <div class="ring" @click="ring"></div>
    <div class="goose" @click="goose"></div>
    <template v-if="currentCustomer">
      <div class="customer">
        <div class="message">
          <div class="text">{{ currentCustomer.request }}</div>
          <div class="budget"><span>~{{currentCustomer.budget}} KC</span></div>
        </div>
        <img
          class="customer_image"
          :src="`../../public/images/customers/${currentCustomer.imageNumber}.png`"
          alt=""
        />
      </div>
    </template>
    <div class="arrow" @click="arrow" v-if="!isBucketOpen">
      <img src="./../../public/images/arrow.png" alt="" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  position: relative;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url('../../public/images/obl.png');
  background-repeat: no-repeat;
  background-size: cover;
  display: grid;
  grid-template-columns: 25% 30% 15% 10% 1fr;
  grid-template-rows: 10% 17% 57% 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;

  .ballons,
  .flower-bucket,
  .cash,
  .ring,
  .goose,
  .arrow,
  .customer {
    cursor:
      url('./../../public/images/cursor/active.png') 16 16,
      auto;
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
      color:#FFFFFF;
      font-size: 20px;
    }
    .value {
      padding: 5px 15px;
      background-color: #ffc107de;
      color: #000000;
    }
    .left-radius{
      border-bottom-left-radius: 15px;
    }
    .right-status{
      border-bottom-right-radius: 15px;
    }
  }

  .ballons {
    grid-area: 1 / 1 / 2 / 4;
  }

  .flower-bucket {
    grid-area: 3 / 1 / 4 / 2;
  }
  .cash {
    grid-area: 3 / 2 / 4 / 3;
  }
  .ring {
    grid-area: 3 / 3 / 4 / 4;
  }
  .customer {
    grid-area: 2 / 3 / 4 / 5;
    position: relative;
    .customer_image {
      position: absolute;
      width: 700px;
      height: 670px;
      object-fit: cover;
    }
    .message {
      position: absolute;
      display: grid;
      grid-template-rows: 1fr 60px;
      justify-content: center;
      align-items: center;
      z-index: 1;
      left: -600px;
      top: -60px;
      width: 600px;
      height: 300px;
      font-family: 'Pacifico', cursive;
      font-size: 30px;
      color: black;
      background-color: rgba(255, 255, 255, 0.904);
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      .text {
        padding: 20px;
        justify-self: center;
      }
      .budget {
        background-color: rgba(46, 177, 46, 0.897);
        color: rgb(32, 82, 32);
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
        text-align: center;
        align-content: center;
        height: 100%;
      }
    }
    &:hover {
      z-index: 99999;
    }
  }
  .goose {
    grid-area: 3 / 5 / 4 / 6;
  }

  .arrow {
    grid-area: 4 / 1 / 5 / 2;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    img {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
