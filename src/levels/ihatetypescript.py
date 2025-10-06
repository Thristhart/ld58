every_levelname = ["basic","basketball","boxes1","boxes2","c_shape","canyon_1","corners_in","corners_mixes","corners_out","corners_up","cubbies","equalsmore","letmein","LL","plus","zoo"]

#I have to write some very repetitious typescript
#So I'm making a python script to do it for me instead

importline = "import {lname} from \".{lname}.png\";\n"
exportline = "    loadLevel(\"{lname}\", loadImage({lname})),\n"

importlines=[]
exportlines=[]
for level in every_levelname:
    importlines += importline.format(lname=level)
    exportlines += exportline.format(lname=level)


print("the importlines\n")
print("".join(importlines))

print("\n\n\ the exportlines\n")
print("".join(exportlines))