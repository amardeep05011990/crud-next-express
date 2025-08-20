// package;

// import openfl.display.Sprite;
// import haxe.ui.HaxeUIApp;
// import haxe.ui.components.Button;

// class Main extends Sprite {
//     public function new() {
//         super();

//         var app = new HaxeUIApp();
//         app.ready(function() {
//             var button = new Button();
//             button.text = "Click Me!";
//             button.onClick = function(_) {
//                 trace("✅ Button Clicked!");
//             }
//             app.addComponent(button);
//         });
//         app.start(); // ✅ No arguments
//     }
// }


// package;

// import openfl.display.Sprite;
// import haxe.ui.HaxeUIApp;
// import MainView;

// class Main extends Sprite {
//     public function new() {
//         super();

//         var app = new HaxeUIApp();
//         app.ready(() -> {
//             var mainView = new MainView();
//             app.addComponent(mainView);
//         });
//         app.start();
//     }
// }



package;

import openfl.display.Sprite;
import haxe.ui.HaxeUIApp;
import haxe.ui.core.Component;
import haxe.ui.Toolkit;

class Main extends Sprite {
    public function new() {
        super();

        var app = new HaxeUIApp();
        app.ready(function() {
            // ✅ Load the XML UI from file
            var mainView:Component = Toolkit.processXmlResource("assets/ui/MainView.xml");
            app.addComponent(mainView);
        });

        app.start();
    }
}




