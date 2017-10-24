var Settings = function () {
	this.MaxFPS = 60;
	this.Start = "enter";
	this.Select = "esc";
	this.Up = "up";
	this.Down = "down";
	this.Left = "left";
	this.Right = "right";
	this.A = "Z";
	this.B = "X";
	this.X = "C";
	this.Y = "V";
	this.L = "A";
	this.R = "S";

	this.configureGUI = function (GUI) {
		// GUI.add(this, "Start");
		// GUI.add(this, "Select");
		GUI.add(this, "Up");
		GUI.add(this, "Right");
		GUI.add(this, "Down");
		GUI.add(this, "Left");
		GUI.add(this, "A");
		GUI.add(this, "B");
		GUI.add(this, "X");
		GUI.add(this, "Y");
		GUI.add(this, "L");
		GUI.add(this, "R");
	}
}