<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
const props = defineProps(['flowers', 'request-categories', 'budget'])
const emit = defineEmits(['skip-customer', 'make-bouket'])
function handleClick(event) {
  event.stopPropagation()
}
const pickedFlowers = ref(new Map())
const addFlowers = (flowerName, multiplier) => {
  const flower = props.flowers.find((el) => el.name == flowerName)

  if (flower.count >= multiplier) {
    if (pickedFlowers.value.has(flowerName)) {
      let pickedFlower = pickedFlowers.value.get(flowerName)
      pickedFlower += multiplier
      pickedFlowers.value.set(flowerName, pickedFlower)
    } else {
      pickedFlowers.value.set(flowerName, multiplier)
    }
    flower.count -= multiplier
  }
}

const backFlowers = (flowerName, isAll = false) => {
  const flower = props.flowers.find((el) => el.name == flowerName)
  let savedFlower = pickedFlowers.value.get(flowerName)
  if (flower.count != 0) {
    flower.count += isAll ? savedFlower : 1
  }
  if (isAll || flower.count == 0) {
    pickedFlowers.value.delete(flowerName)
  } else {
    pickedFlowers.value.set(flowerName, savedFlower - 1)
  }
}

const resetFlowerPicked = () => {
  pickedFlowers.value.forEach((value, key) => {
    // Ищем цветок по имени в props.flowers
    const flower = props.flowers.find((el) => el.name === key)
    flower.count += value
  })
  pickedFlowers.value.clear()
}

const totalPrice = computed(() => {
  // Создаем переменную для хранения общей суммы
  let total = 0

  // Проходимся по всем элементам Map
  pickedFlowers.value.forEach((value, key) => {
    // Ищем цветок по имени в props.flowers
    const flower = props.flowers.find((el) => el.name === key)

    // Если цветок найден, умножаем его цену на значение из Map и добавляем к общей сумме
    if (flower) {
      total += flower.sellPrice * value
    }
  })

  return total
})

const totalPriceReal = computed(() => {
  // Создаем переменную для хранения общей суммы
  let total = 0

  // Проходимся по всем элементам Map
  pickedFlowers.value.forEach((value, key) => {
    // Ищем цветок по имени в props.flowers
    const flower = props.flowers.find((el) => el.name === key)
    // Если цветок найден, умножаем его цену на значение из Map и добавляем к общей сумме
    if (flower) {
      if (props.requestCategories.includes(...flower.categories)) {
        total += flower.sellPrice * value
      } else {
        total += flower.sellPrice * value * 0.75
      }
    }
  })

  // Проверяем, превышает ли общая сумма бюджет на 15%
  const budgetWithMarkup = props.budget * 1.15 // Увеличиваем бюджет на 15%
  if (total > budgetWithMarkup) {
    total = budgetWithMarkup // Если да, устанавливаем общую сумму равной бюджету с наценкой на 15%
  }

  return total
})

const categoryFlowers = computed(() => {
  // Создаем пустой массив для хранения цветков выбранной категории
  const result = []

  // Проходимся по всем элементам Map
  pickedFlowers.value.forEach((value, key) => {
    // Ищем цветок по имени в props.flowers
    const flower = props.flowers.find((el) => el.name === key)
    result.push(...flower.categories)
  })
  return result
})

const rejectClient = () => {
  resetFlowerPicked()
  emit('skip-customer')
}

const makeBouket = () => {
  emit('make-bouket', pickedFlowers.value)
}
onBeforeUnmount(resetFlowerPicked)
</script>
<template>
  <div class="flower-wrapper" @click.stop="handleClick">
    <div class="flower" v-for="item in props.flowers" :key="item.id">
      <div class="tooltip">
        <img :src="`../../public/flowers/${item.imageName}.png`" alt="" />
        <span class="tooltip-text">
          <span style="font-weight: 700">{{ item.name }}</span
          ><br />
          {{ item.categories.join(' ') }}
        </span>
      </div>
      <div class="flower-stats">
        <div class="tooltip">
          <div class="count">
            <div class="value" style="background-color: #fff6e9">{{ item.count }}</div>
          </div>
          <span class="tooltip-text">На складе</span>
        </div>
        <div class="tooltip">
          <div class="price">
            <div class="value" style="background-color: #ffb534">{{ item.sellPrice }}</div>
          </div>
          <span class="tooltip-text">Цена продажи</span>
        </div>
      </div>
      <div class="controls">
        <button class="button-3" role="button" @click="addFlowers(item.name, 1)">x1</button>
        <button class="button-3" role="button" @click="addFlowers(item.name, 5)">x5</button>
        <button class="button-3" role="button" @click="addFlowers(item.name, 15)">x15</button>
      </div>
    </div>
    <div class="controls-wrapper">
      <div class="info">
        <div class="flowers-info">
          <div
            class="flower-data clickable"
            v-for="(item, index) in Array.from(pickedFlowers)"
            :key="index"
            @click.left.prevent="backFlowers(item[0], false)"
            @click.right.prevent="backFlowers(item[0], true)"
          >
            {{ item[0] }}: <span class="flower-count">{{ item[1] }}</span>
          </div>
        </div>
        <div class="prices-wrapper">
          <div class="price clickable" v-if="Array.from(pickedFlowers).length > 0">
            Базовая цена: <span class="price-value">{{ totalPrice }}</span>
          </div>
          <div class="price clickable" v-if="Array.from(pickedFlowers).length > 0">
            Реальная цена: <span class="price-value">{{ totalPriceReal.toFixed(2) }}</span>
          </div>
        </div>
        <div class="categories">
          <span class="category-name clickable" v-for="item in categoryFlowers" :key="item">{{
            item
          }}</span>
        </div>
      </div>
      <div class="main-controls">
        <button class="button-37" role="button" @click="makeBouket">Сделать букетик</button>
        <button class="button-5" role="button" @click="resetFlowerPicked">Сбросить выбор</button>
        <button class="button-45" role="button" @click="rejectClient">Отказать клиенту</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.flower-wrapper {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  background-image: url('../../public/images/box.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 15%;
  width: 70vw;
  height: 85vh;
  top: 50%;
  left: 50%;
  transform: translate(-70%, -50%);
  z-index: 15;
  gap: 10px;
  .controls-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
  }
  img {
    width: 100px;
    height: 100px;
  }
  .flower {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    color: rgb(71, 187, 71);
    .flower-stats {
      display: flex;
    }
    .count,
    .price {
      font-family: 'Pacifico', cursive;
      font-size: 15px;
      display: flex;
      .text {
        padding: 5px 10px;
        background: rgb(245, 230, 245);
      }
      .value {
        font-size: 30px;
        padding: 0px 10px;
        background-color: #bfea7c;
      }
    }
  }
  .controls {
    display: flex;
    gap: 5px;
  }
  .main-controls {
    display: flex;
    gap: 10px;
    justify-self: flex-end;
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .flowers-info {
      display: flex;
      gap: 2px;
      .flower-data {
        font-family: 'Pacifico', cursive;
        font-size: 20px;
        background-color: yellow;
        color: rgb(51, 148, 39);
        border: none;
        border-radius: 20px;
        padding: 3px 8px;
        .flower-count {
          color: rgb(28, 218, 101);
        }
      }
    }
    .price {
      max-width: max-content;
      font-family: 'Pacifico', cursive;
      font-size: 20px;
      background-color: rgb(55, 192, 37);
      color: rgb(240, 236, 28);
      border: none;
      border-radius: 20px;
      padding: 3px 8px;
      .price-value {
        color: rgb(24, 119, 44);
      }
    }
    .categories {
      display: flex;
      gap: 5px;
      .category-name {
        max-width: max-content;
        font-family: 'Pacifico', cursive;
        font-size: 20px;
        background-color: rgb(216, 99, 210);
        color: rgb(40, 49, 36);
        border: none;
        border-radius: 20px;
        padding: 3px 8px;
      }
    }
    .prices-wrapper {
      display: flex;
      gap: 5px;
    }
  }
  .clickable {
    cursor: pointer;
  }
}

.button-3 {
  appearance: none;
  background-color: #2ea44f;
  border: 1px solid rgba(27, 31, 35, 0.15);
  border-radius: 6px;
  box-shadow: rgba(27, 31, 35, 0.1) 0 1px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji';
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding: 6px 16px;
  position: relative;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
  white-space: nowrap;
}

.button-3:focus:not(:focus-visible):not(.focus-visible) {
  box-shadow: none;
  outline: none;
}

.button-3:hover {
  background-color: #2c974b;
}

.button-3:focus {
  box-shadow: rgba(46, 164, 79, 0.4) 0 0 0 3px;
  outline: none;
}

.button-3:disabled {
  background-color: #94d3a2;
  border-color: rgba(27, 31, 35, 0.1);
  color: rgba(255, 255, 255, 0.8);
  cursor: default;
}

.button-3:active {
  background-color: #298e46;
  box-shadow: rgba(20, 70, 32, 0.2) 0 1px 0 inset;
}

/* CSS */
.button-37 {
  background-color: #13aa52;
  border: 1px solid #13aa52;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.1) 0 2px 4px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  font-family:
    'Akzidenz Grotesk BQ Medium',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-size: 16px;
  font-weight: 400;
  outline: none;
  outline: 0;
  padding: 10px 25px;
  text-align: center;
  transform: translateY(0);
  transition:
    transform 150ms,
    box-shadow 150ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-37:hover {
  box-shadow: rgba(0, 0, 0, 0.15) 0 3px 9px 0;
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .button-37 {
    padding: 10px 30px;
  }
}

/* CSS */
.button-5 {
  align-items: center;
  background-clip: padding-box;
  background-color: #fa6400;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  box-shadow: rgba(0, 0, 0, 0.02) 0 1px 3px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-family:
    system-ui,
    -apple-system,
    system-ui,
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  line-height: 1.25;
  margin: 0;
  min-height: 3rem;
  padding: calc(0.875rem - 1px) calc(1.5rem - 1px);
  position: relative;
  text-decoration: none;
  transition: all 250ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  width: auto;
}

.button-5:hover,
.button-5:focus {
  background-color: #fb8332;
  box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
}

.button-5:hover {
  transform: translateY(-1px);
}

.button-5:active {
  background-color: #c85000;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 4px;
  transform: translateY(0);
}

/* CSS */
.button-45 {
  align-items: center;
  background-color: #ffe7e7;
  background-position: 0 0;
  border: 1px solid #fee0e0;
  border-radius: 11px;
  box-sizing: border-box;
  color: #d33a2c;
  cursor: pointer;
  display: flex;
  font-size: 1rem;
  font-weight: 700;
  line-height: 33.4929px;
  list-style: outside url(https://www.smashingmagazine.com/images/bullet.svg) none;
  padding: 2px 12px;
  text-align: left;
  text-decoration: none;
  text-shadow: none;
  text-underline-offset: 1px;
  transition:
    border 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  word-break: break-word;
}

.button-45:active,
.button-45:hover,
.button-45:focus {
  outline: 0;
}

.button-45:active {
  background-color: #d33a2c;
  box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px 0 inset;
  color: #ffffff;
}

.button-45:hover {
  background-color: #ffe3e3;
  border-color: #faa4a4;
}

.button-45:active:hover,
.button-45:focus:hover,
.button-45:focus {
  background-color: #d33a2c;
  box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px 0 inset;
  color: #ffffff;
}
</style>
