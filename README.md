# README #

## Pre-Requisites ##
* [Nodejs][Nodejs]
* [OpenCV 2.4][Opencv] (used on the mod to return the frame screen of the emulator)
* Any other requesites to run [Snes9x][Snes9x]

## Instalation ##
* Download the repository and `npm install`
* Copy `.snes9x` folder to your user home folder
* Configure `settings.js` file

## Saved data format ##

```
{
  "score": Player 1 Life - Player 2 Life,
  "time": Fight Time,
  "frame": Frame Number,
  "image": Base64 string of the frame screen
}
```


[Snes9x]: https://github.com/snes9xgit/snes9x
[Nodejs]: https://nodejs.org/en/
[Opencv]: https://docs.opencv.org/2.4.13/doc/tutorials/introduction/linux_install/linux_install.html
