#!/bin/bash

users=('chen' 'yueru' 'weihao' 'chun-ting' 'qin' 'jian' 'shangwen' 'siyang' 'ruiyuan' 'xiaqing' 'yuzhuo' 'ronald' 'yuhang' 'yuanhang' 'haiqiang' 'ye' 'chihao' 'hao' 'heming' 'junting' 'wenchao' 'zhehang' 'yiyue')

for u in ${users[@]}; do
echo ${u}
sudo adduser ${u}
done
