# Combine data from the different files:

library(tidyverse)

file0 <- read_csv("data_20210208/soc_20210208_0.csv")
file0_neo <- rename_with(file0, ~ tolower(gsub(".", "_", .x, fixed = TRUE)))
