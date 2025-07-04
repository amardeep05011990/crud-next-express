// package;

// import openfl.display.Sprite;
// import feathers.controls.Button;
// import feathers.events.TriggerEvent;

// class Main extends Sprite
// {
// 	public function new()
// 	{
// 		super();
// 		var button = new Button();
// 		button.text = "Click Me";
// 		button.addEventListener(TriggerEvent.TRIGGER, onButtonTrigger);
// 		addChild(button);
// 	}

// 	private function onButtonTrigger(event:TriggerEvent):Void {
// 		trace("Clicked or tapped the button");
// 	}
// }


import com.feathersui.themes.minimal.MinimalTheme;
import feathers.controls.Application;

class Main extends Application {
	public function new() {
		Theme.setTheme(new MinimalTheme(), this);
		super();
	}
}
