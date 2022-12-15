images were downloaded with curl and formated with imagemagick. Creating a tool to automate this should be trivial.

`mogrify -format webP -resize x200 -quality 20 -path ./ *.jpg`