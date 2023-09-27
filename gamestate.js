
import jsonResources from './resources.json' assert { type: 'json' };
import jsonBuildings from './buildings.json' assert { type: 'json' };

export class BismarckGameState extends EventTarget
{
    constructor()
    {
        super();
        
        this.STATE_NORMAL = 0;
        this.STATE_PREVIEW_BUILDING = 1;
        this.STATE_EDIT_BUILDING = 2;

        this.totalPopulation = 10;
        this.availablePopulation = 10;
        this.turn = 0;
        this.buildings = [];
        this.stockpile = new BismarckResourceStockpile();
    }

    AddBuilding(id)
    {
        let building = new BismarckBuilding(jsonBuildings[id]);
        this.buildings.push(building);
        console.log("added a new building, building count is now " + this.buildings.length);
    }

    EndTurn()
    {
        console.log('this.buildings.length=' + this.buildings.length);
        for (var i=0; i<this.buildings.length; i++)
        {
            this.buildings[i].DoProcess(this.stockpile);
        }
    }

    SelectBuilding(id)
    {

    }

    SetButtonBar(buttonBar)
    {
        buttonBar.addListener("onSelectionChange", ChangeSelectionMode)
    }

    ChangeSelectionMode(event)
    {
        if (newCube != null) 
        {
            scene.remove(newCube);
            newCube = null;
        }

        if (event.id != null)
        {
            newCube = new THREE.Mesh( newBuildingGeometry, buildingNewMaterial );
            newCube.castShadow = true;
            newCube.receiveShadow = true;
            scene.add( newCube );

            buildingPanel.Show(jsonBuildings[event.id]);
            currentSelectedBuildingId = event.id;
        }
        else
        {
            buildingPanel.Hide();
            currentSelectedBuildingId = null;
        }
    }
}


class BismarckResourceStockpile
{
    constructor()
    {
        this.resources = new Map();
        for (var key in jsonResources)
        {
            this.resources.set(key, 0);
        }
    }

    GetResourceAmount(id)
    {
        return this.resources.get(id);
    }

    Withdraw(id, quantity)
    {
        let newQuantity = this.GetResourceAmount(id) - quantity;
        this.resources.set(id, newQuantity);
    }

    Deposit(id, quantity)
    {
        let newQuantity = this.GetResourceAmount(id) + quantity;
        this.resources.set(id, newQuantity);
    }
}

class BismarckBuilding
{
    constructor(buildingData)
    {
        this.buildingData = buildingData;
        this.productionPopulationAssigned = new Map();
        this.productionPopulationToProcess = new Map();
        for (var key in this.buildingData.productions)
        {
            this.productionPopulationAssigned.set(key, 0);
            this.productionPopulationToProcess.set(key, 0);
        }
    }

    Reset()
    {
        this.hasBeenCompletelyProcessed = false;
        for (const key of this.productionPopulationAssigned.keys())
        {
            this.productionPopulationToProcess.get(key) = this.productionPopulationAssigned.get(key);
        }
    }

    DoProcess(stockpile)
    {
        this.hasBeenCompletelyProcessed = true;
        for (const key of this.productionPopulationAssigned.keys())
        {
            var processCount = this.productionPopulationToProcess.get(key);
            var processedCount = this.ProcessProduction(this.buildingData.productions[key], stockpile, processCount);
            this.productionPopulationToProcess.set(key, processCount - processedCount);
            if (processCount > processedCount)
            {
                this.hasBeenCompletelyProcessed = false;
            }
        }

        return 
    }

    ProcessProduction(productionData, stockpile, processCount)
    {
        var processablePerInput = [];
        if (productionData.inputs.length > 0)
        {
            for (let index = 0; index < productionData.inputs.length; index++)
            {
                var resourceId = productionData.inputs[index].resource;
                var resourceRequired = productionData.inputs[index].quantity;
                var resourceAvailable = stockpile.GetResourceAmount(resourceId);
                var processable = Math.floor(resourceAvailable / resourceRequired);
                processablePerInput.push(Math.min(processable, processCount));
            }
    
            var processable = Math.min(...processablePerInput);
        }
        else
        {
            processable = processCount;
        }

        for (let index = 0; index < productionData.inputs.length; index++)
        {
            var resourceId = productionData.inputs[index].resource;
            var resourceRequired = productionData.inputs[index].quantity;
            stockpile.Withdraw(resourceId, resourceRequired * processable);
        }

        for (let index = 0; index < productionData.outputs.length; index++)
        {
            var resourceId = productionData.outputs[index].resource;
            var resourceAcquired = productionData.outputs[index].quantity;
            stockpile.Withdraw(resourceId, resourceAcquired * processable);
        }

        return processable;
    }
}