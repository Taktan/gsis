<template>
	<div class="right-panel">
		<v-card>
				<v-card-text>
					<v-img
							aspect-ratio="1"
							lazy-src="/out.jpg"
							src="/out.jpg"
							class="mb-4"
					></v-img>
					<div class="d-flex">
							<v-text-field v-model="coordinates.longitude" :rules="[rules.coordinates]" label="Долгота" class="mr-1" outlined dense /> 
							<v-text-field v-model="coordinates.latitude" :rules="[rules.coordinates]" label="Широта" outlined dense />
					</div>
					<div class="d-flex">
							<v-menu v-model="menuDateStart" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
								<template v-slot:activator="{ on, attrs }">
										<v-text-field v-model="dateStart" label="Начало" class="mr-1" readonly v-bind="attrs" v-on="on" outlined dense/>
								</template>
								<v-date-picker v-model="dateStart" @input="menuDateStart = false" :max="dateEnd"/>
							</v-menu>
							<v-menu v-model="menuDateEnd" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
								<template v-slot:activator="{ on, attrs }">
										<v-text-field v-model="dateEnd" label="Конец" readonly v-bind="attrs" v-on="on" outlined dense/>
								</template>
								<v-date-picker v-model="dateEnd" @input="menuDateEnd = false" :min="dateStart"/>
							</v-menu>
					</div>
					<div class="d-flex input-width-33">
							<v-text-field label="Площадь" v-model="area" disabled :rules="[rules.integer]" outlined dense />
							<v-text-field class="ml-1" v-model="scale" disabled label="Масштаб" :rules="[rules.integer, rules.min10]"  outlined dense />
					</div>
					<div class="d-flex">
						<v-select class="mr-1" :items="satellites" v-model="satellite" outlined dense label="Спутник" disabled hide-details></v-select>
						<v-select :items="bands" v-model="selectBands" outlined dense label="Спектры" multiple hide-details>
							<template v-slot:selection="{ index }">
								<span v-if="index === 1" class="grey--text caption">{{ selectBands.length }} выбано</span>
							</template>
						</v-select>
					</div>
					<v-radio-group v-model="postFunction" row hide-details>
						<v-radio label=".median()" value="median"/>
						<v-radio label=".mean()" value="mean"/>
						<v-radio label=".first()" value="first"/>
					</v-radio-group>
					<v-checkbox v-model="checkColorImage" label="Цветное изображение" />
					<v-btn block color="primary" @click="getShots" :disabled="disabledButton">Получить</v-btn>
				</v-card-text>
		</v-card>
		</div>
</template>

<script>
export default {
	data:()=>({
		coordinates:{
			longitude: 135,
			latitude: 45
		},
		dateStart: new Date("2017-01-01").toISOString().substr(0, 10),
		dateEnd: new Date().toISOString().substr(0, 10),
		menuDateStart: false,
		menuDateEnd: false,
		satellites:[
			{
				text: 'Sentinel-2 Level-2A',
				value: 'COPERNICUS/S2_SR',
			},
			{
				text: 'Sentinel-2 Level-1C',
				value: 'COPERNICUS/S2',
				disabled: true,
			},
			{
				text: 'Landsat-8 Surface Reflectance Tier 1',
				value: "LANDSAT/LC08/C01/T1_SR",
				disabled: true,
			}
		],
		satellite: 'COPERNICUS/S2_SR',
		area: 1,
		scale: 10,
		bands: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12', 'TCI_R', 'TCI_G', 'TCI_B'],
		selectBands: ['B2', 'B3', 'B4', 'B5', 'TCI_R', 'TCI_G', 'TCI_B'],
		checkColorImage: true,
		postFunction: 'median',                                                                                                                                                                                        
		
		rules:{
			coordinates: value => Number.isFinite(+value) && value.length != 0 || "Невалидное значение",
			integer: value => Number.isInteger(+value) || "Нужно целое значение",
			min10: value => value > 10 || "Нужно больше 10",
			
		}
	}),
	computed:{
		disabledButton(){
			if(this.coordinates.longitude && this.coordinates.latitude && this.dateStart && this.area && this.scale && this.selectBands.length) return false
			else return true
		}
	},
	methods:{
		getShots(){

		}
	}
}
</script>

<style>

</style>