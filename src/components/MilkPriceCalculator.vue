<template>
    <div>
        <!-- Milk Type Selection -->
        <div class="milk-type">
            <div class="type-ele button" v-for="type in milkTypes" :key="type.value">
                <input
                        type="radio"
                        :id="type.value"
                        :value="type.value"
                        v-model="milkType"
                        :required="requiredValidation"
                />
                <label :for="type.value">{{ type.label }}</label>
            </div>
        </div>

        <!-- Input Form -->
        <div class="settings">
            <div class="set-ele" v-for="input in currentInputs" :key="input.name">
                <label :for="input.name">{{ input.label }}:</label>
                <input
                        :type="input.type"
                        v-model="input.value"
                        :required="input.required"
                />
            </div>
            <button v-if="!isEditing" type="submit" @click="calculateAndSavePrice">计算每升价格并保存</button>
            <button v-if="isEditing" type="submit" @click="updateRecord">更新到{{ editingRecord.name }}</button>
        </div>

        <!-- Saved Records Table -->
        <div class="save-info">
            <div v-for="(tableConfig, tableIndex) in tableConfigs" :key="tableIndex" class="info-table">
                <table>
                    <thead>
                    <tr>
                        <th v-for="column in tableConfig.columns" :key="column.key">{{ column.label }}</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(record, index) in tableConfig.records" :key="index">
                        <td v-for="column in tableConfig.columns" :key="column.key">
                            {{ column.key === 'pricePerLitre' ? calculatePricePerLitre(record) : record[column.key] }}
                        </td>
                        <td>
                            <button @click="editRecord(record, index)">编辑</button>
                            <button @click="deleteRecord(index)">删除</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
    import { defaultRecords } from '@/data//defaultRecords';

    export default {
        data() {
            return {
                milkType: 'powder',
                milkTypeConfigs: [
                    { value: 'powder', label: '奶粉' },
                    { value: 'fresh', label: '鲜奶' },
                ],
                requiredValidation: true,
                records: [],
                isEditing: false,
                editIndex: null,
                editingRecord: null,
                inputs: {
                    powder: [
                        { name: 'name', label: '名称', type: 'text', value: null, required: true },
                        { name: 'price', label: '每罐价格', type: 'number', value: null, required: true },
                        { name: 'weight', label: '每罐重量 (g)', type: 'number', value: null, required: true },
                        { name: 'scoopWeight', label: '每勺重量 (g)', type: 'number', value: 4.4, required: true },
                        { name: 'scoopVolume', label: '每勺体积 (ml)', type: 'number', value: 30, required: true },
                    ],
                    fresh: [
                        { name: 'name', label: '名称', type: 'text', value: null, required: true },
                        { name: 'price', label: '总价格', type: 'number', value: null, required: true },
                        { name: 'totalBottles', label: '总瓶数', type: 'number', value: null, required: true },
                        { name: 'volumePerBottle', label: '每瓶体积 (ml)', type: 'number', value: null, required: true },
                    ]
                }
            };
        },
        computed: {
            currentInputs() {
                return this.inputs[this.milkType];
            },
            tableConfigs() {
                return [
                    {
                        columns: this.getTableColumns('powder'),
                        records: this.getSavedRecords('powder')
                    },
                    {
                        columns: this.getTableColumns('fresh'),
                        records: this.getSavedRecords('fresh')
                    }
                ];
            },
            milkTypes() {
                return this.milkTypeConfigs;
            }
        },
        methods: {
            calculateAndSavePrice() {
                const newRecord = {
                    milkType: this.milkType,
                    name: this.inputs[this.milkType].find(input => input.name === 'name').value,
                    price: this.inputs[this.milkType].find(input => input.name === 'price').value,
                    weight: this.milkType === 'powder' ? this.inputs.powder.find(input => input.name === 'weight').value : null,
                    scoopWeight: this.milkType === 'powder' ? this.inputs.powder.find(input => input.name === 'scoopWeight').value : null,
                    scoopVolume: this.milkType === 'powder' ? this.inputs.powder.find(input => input.name === 'scoopVolume').value : null,
                    totalBottles: this.milkType === 'fresh' ? this.inputs.fresh.find(input => input.name === 'totalBottles').value : null,
                    volumePerBottle: this.milkType === 'fresh' ? this.inputs.fresh.find(input => input.name === 'volumePerBottle').value : null,
                };
                this.records.push(newRecord);
                this.updateLocalStorage();
                this.resetForm();
            },
            updateRecord() {
                if (this.editingRecord !== null) {
                    Object.assign(this.editingRecord, {
                        name: this.inputs[this.milkType].find(input => input.name === 'name').value,
                        price: this.inputs[this.milkType].find(input => input.name === 'price').value,
                        weight: this.milkType === 'powder' ? this.inputs.powder.find(input => input.name === 'weight').value : null,
                        scoopWeight: this.milkType === 'powder' ? this.inputs.powder.find(input => input.name === 'scoopWeight').value : null,
                        scoopVolume: this.milkType === 'powder' ? this.inputs.powder.find(input => input.name === 'scoopVolume').value : null,
                        totalBottles: this.milkType === 'fresh' ? this.inputs.fresh.find(input => input.name === 'totalBottles').value : null,
                        volumePerBottle: this.milkType === 'fresh' ? this.inputs.fresh.find(input => input.name === 'volumePerBottle').value : null,
                    });
                    this.records.splice(this.editIndex, 1, this.editingRecord);
                    this.updateLocalStorage();
                    this.resetForm();
                    this.isEditing = false;
                    this.editIndex = null;
                    this.editingRecord = null;
                }
            },
            calculatePricePerLitre(record) {
                let pricePerLitre = null;
                if (record.milkType === 'powder') {
                    const totalVolume = (record.weight / record.scoopWeight) * record.scoopVolume;
                    pricePerLitre = (record.price / totalVolume) * 1000;
                } else {
                    const totalVolume = record.totalBottles * record.volumePerBottle;
                    pricePerLitre = (record.price / totalVolume) * 1000;
                }
                return pricePerLitre.toFixed(2);
            },
            resetForm() {
                this.inputs[this.milkType].forEach(input => {
                    input.value = input.name === 'scoopWeight' ? 4.4 : input.name === 'scoopVolume' ? 30 : null;
                });
            },
            updateLocalStorage() {
                localStorage.setItem('milkRecords', JSON.stringify(this.records));
            },
            getSavedRecords(milkType) {
                return this.records.filter(record => record.milkType === milkType);
            },
            getTableColumns(milkType) {
                let columns = [
                    { key: 'name', label: '名称' },
                    { key: 'milkType', label: '奶的类型' },
                    { key: 'price', label: '价格' }
                ];
                if (milkType === 'powder') {
                    columns.push(
                        { key: 'weight', label: '重量 (g)' },
                        { key: 'scoopWeight', label: '勺重 (g)' },
                        { key: 'scoopVolume', label: '冲泡量 (ml)' },
                        { key: 'pricePerLitre', label: '每升价格' }
                    );
                } else if (milkType === 'fresh') {
                    columns.push(
                        { key: 'totalBottles', label: '总瓶数' },
                        { key: 'volumePerBottle', label: '每瓶体积 (ml)' },
                        { key: 'pricePerLitre', label: '每升价格' }
                    );
                }
                return columns;
            },
            editRecord(record, index) {
                this.milkType = record.milkType;
                this.inputs[this.milkType].forEach(input => {
                    input.value = record[input.name];
                });
                this.isEditing = true;
                this.editIndex = index;
                this.editingRecord = record;
            },
            deleteRecord(index) {
                this.records.splice(index, 1);
                this.updateLocalStorage();
            }
        },
        created() {
            let savedRecords = JSON.parse(localStorage.getItem('milkRecords')) || [];

            // 合并默认记录和 localStorage 中的记录，优先使用 localStorage 中的记录
            this.records = savedRecords.length > 0 ? savedRecords : defaultRecords;

            // 更新 localStorage 中的数据，确保默认记录在用户第一次加载时保存到 localStorage
            if (savedRecords.length === 0) {
                localStorage.setItem('milkRecords', JSON.stringify(defaultRecords));
            }
        },
    };
</script>
