import "frida-il2cpp-bridge";
import "frida-java-menu";

const cache = new Map<Il2Cpp.Class, Il2Cpp.Object[]>();

function choose(klass: Il2Cpp.Class, ignoreCache: boolean = false): Il2Cpp.Object[] {
    if (!ignoreCache && cache.has(klass)) {
        return cache.get(klass)!;
    }

    const result = Il2Cpp.gc.choose(klass);
    if (!ignoreCache)
        cache.set(klass, result);
    
    return result;
}

function main() {
    const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;
    const AdChipsButton = AssemblyCSharp.class("AdChipsButton");
    const SkinsHandler = AssemblyCSharp.class("SkinsHandler");
    const PlayerSkin = AssemblyCSharp.class("PlayerSkin");

    
    function addMoney() {
        choose(AdChipsButton).forEach(e => e.method("AddChips").invoke());
    }

    function unlockSkins() {
        const instance = SkinsHandler.field<Il2Cpp.Object>("Instance").value;
        for (let skin of new Il2Cpp.List<Il2Cpp.Object>(instance.method< /* <Il2Cpp.List<Il2Cpp.Object>> = value is not iterable */ Il2Cpp.Object>("GetNotBoughtSkins").invoke())) {
            instance.method("BuyInstant").invoke(skin.field("Name").value);
        }
    }

    function changeSpecOfSkin(name: string, value: number) {
        choose(PlayerSkin).forEach(e => e.field(name).value = value);
    }

    const layout = new Menu.LGLLayout();
    const menu = new Menu.Composer<typeof layout>("Skibidi Toilet Hack", "bruh", layout);

    menu.icon("https://media.tenor.com/YzseE_-j48QAAAAM/skibidi-toilet.gif", "Web");

    Menu.add(layout.button("Add money (1850)", addMoney));
    Menu.add(layout.button("Unlock skins", () => {
        changeSpecOfSkin("Price", 0);
        unlockSkins();
    }));
    Menu.add(layout.category("Buffs (run before match)"));
    Menu.add(layout.seekbar("Damage buff: {0}", 1337, 0, (i) => Il2Cpp.perform(() => changeSpecOfSkin("DamageBuff", i))));
    Menu.add(layout.seekbar("Health buff: {0}", 1337, 0, (i) => Il2Cpp.perform(() => changeSpecOfSkin("HealthBuff", i))));
    Menu.add(layout.seekbar("Attack delay: {0}", 10, 0, (i) => Il2Cpp.perform(() => changeSpecOfSkin("AttackDelay", i))));
    Menu.add(layout.seekbar("Speed buff (might cause bugs): {0}", 10, 0, (i) => Il2Cpp.perform(() => changeSpecOfSkin("SpeedBuff", i))));

    menu.show();
}

const android_log_write = new NativeFunction(
    Module.getExportByName(null, '__android_log_write'),
    'int',
    ['int', 'pointer', 'pointer']
);
const tag = Memory.allocUtf8String("frida");
console.log = function(str) {
    android_log_write(3, tag, Memory.allocUtf8String(str));
}
console.warn = function(str) {
    android_log_write(3, tag, Memory.allocUtf8String(str));
}
console.error = function(str) {
    android_log_write(3, tag, Memory.allocUtf8String(str));
}

Il2Cpp.perform(() => Menu.waitForInit(main));