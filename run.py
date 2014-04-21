#-*- coding: utf-8 -*-
import codecs
from TTFRender import generate, get_token_list

token_list = []
file=codecs.open('TTFRender/char.txt','r','utf-8')
while 1:
  char = file.read(1)
  if not char: break
  token_list.append(char)

print token_list

#token_list = ["有","志","者","事","竟","成","中","午"]
ttf_file   = "TTFRender/fonts/new_current.ttf"

generate(token_list, "current.ttf", ttf_file)
