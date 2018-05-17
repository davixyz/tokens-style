//
// ios/Color.swift
//
// Do not edit directly, generated on Wed May 16 2018 21:31:43 GMT-0700 (PDT)
//

import UIKit

extension UIColor {
    class var ColorTextPrimaryDefault: UIColor {return UIColor(fromHex:0xffffffff)}
		class var ColorTextSecondaryDefault: UIColor {return UIColor(fromHex:0x50c7f9ff)}
		class var ColorTextSecondaryActive: UIColor {return UIColor(fromHex:0x50c7f9ff)}
		class var ColorTextBody: UIColor {return UIColor(fromHex:0x2c2e2fff)}
​
    convenience init(fromHex hex: UInt32) {
        let red   = CGFloat((hex >> 24) & 0xff) / 255.0
        let green = CGFloat((hex >> 16) & 0xff) / 255.0
        let blue  = CGFloat((hex >>  8) & 0xff) / 255.0
        let alpha = CGFloat((hex      ) & 0xff) / 255.0
        self.init(red: red, green: green, blue: blue, alpha: alpha)
    }
}
​/*
Usage:

let newColor: UIColor = .PpColorBackgroundPrimaryDefault

*/
