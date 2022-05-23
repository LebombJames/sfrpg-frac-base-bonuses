const bab = (fact, context) => {
        const data = fact.data;
        const classes = fact.classes;
        
        data.attributes.baseAttackBonus = mergeObject(data.attributes.baseAttackBonus, {
            value: 0,
            rolledMods: [],
            tooltip: []
        }, {overwrite: false});

        /** Clear out default values. */
        data.attributes.baseAttackBonus.value = 0;
        data.attributes.baseAttackBonus.rolledMods = [];

        for (const cls of classes) {
            const classData = cls.data.data;

            let mod = 0;
            switch (classData.bab) {
                case "slow": mod += classData.levels * 0.5; break;
                case "moderate": mod += classData.levels * 0.75; break;
                case "full": mod += classData.levels; break;
            };

            data.attributes.baseAttackBonus.tooltip.push(game.i18n.format("SFRPG.BABTooltip", {
                class: cls.name,
                bonus: mod.signedString()
            }));
            data.attributes.baseAttackBonus.value += mod;
			
        }
		data.attributes.baseAttackBonus.value = Math.floor(data.attributes.baseAttackBonus.value)
        data.attributes.bab = data.attributes.baseAttackBonus.value;
        
        return fact;
    };
    
const saves = (fact, context) => {
    const data = fact.data;
    const classes = fact.classes;

    let fortSave = 0;
    let refSave = 0;
    let willSave = 0;

    const fort = data.attributes.fort;
    const reflex = data.attributes.reflex;
    const will = data.attributes.will;
    
    const saves = ["fort", "ref", "will"]
    let hasFastSave = {
            fort: false,
            ref: false,
            will: false
        };
    
    for (const a of saves) {
        for (const cls of classes) {
            const classData = cls.data.data;
            if (classData[a] === "fast") {
                hasFastSave[a] = true;
            };
        };
    };

    for (const cls of classes) {
        const classData = cls.data.data;

        let slowSave = classData.levels * (1/3);
        let fastSave = classData.levels * 0.5;

        fortSave += classData.fort === "slow" ? slowSave : fastSave;
        fort.tooltip.push(game.i18n.format("SFRPG.SaveClassModTooltip", {
            class: cls.name,
            mod: classData.fort === "slow" ? (Math.round(slowSave * 100) / 100).signedString() : (Math.round(fastSave * 100) / 100).signedString()
        }));
        refSave += classData.ref === "slow" ? slowSave : fastSave;
        reflex.tooltip.push(game.i18n.format("SFRPG.SaveClassModTooltip", {
            class: cls.name,
            mod: classData.ref === "slow" ? (Math.round(slowSave * 100) / 100).signedString() : (Math.round(fastSave * 100) / 100).signedString()
        }));
        willSave += classData.will === "slow" ? slowSave : fastSave;
        will.tooltip.push(game.i18n.format("SFRPG.SaveClassModTooltip", {
            class: cls.name,
            mod: classData.will === "slow" ? (Math.round(slowSave * 100) / 100).signedString() : (Math.round(fastSave * 100) / 100).signedString()
        }));
    }
    
    fort.bonus = Math.floor(fortSave + data.abilities.con.mod + ((hasFastSave.fort) ? 2 : 0));
    reflex.bonus = Math.floor(refSave + data.abilities.dex.mod + ((hasFastSave.ref) ? 2 : 0));
    will.bonus = Math.floor(willSave + data.abilities.wis.mod + ((hasFastSave.will) ? 2 : 0));

    fort.tooltip.push(game.i18n.format("SFRPG.SaveAbilityModTooltip", {
        ability: "Con",
        mod: data.abilities.con.mod.signedString()
    }));

    reflex.tooltip.push(game.i18n.format("SFRPG.SaveAbilityModTooltip", {
        ability: "Dex",
        mod: data.abilities.dex.mod.signedString()
    }));

    will.tooltip.push(game.i18n.format("SFRPG.SaveAbilityModTooltip", {
        ability: "Wis",
        mod: data.abilities.wis.mod.signedString()
    }));
    
    if (hasFastSave.fort) {
        fort.tooltip.push("Fast Save Modiifer: +2");
    };
    
    if (hasFastSave.ref) {
        reflex.tooltip.push("Fast Save Modiifer: +2");
    };
    
    if (hasFastSave.will) {
        will.tooltip.push("Fast Save Modiifer: +2");
    };

    return fact;
};

Hooks.on('sfrpg.registerRules', () => {
    console.log("SFRPG Fractional Base Bonuses | Overriding system rules")
	game.sfrpg.engine.closures.namedClosures.calculateBaseAttackBonus.fn = bab;
    game.sfrpg.engine.closures.namedClosures.calculateBaseSaves.fn = saves;
	});