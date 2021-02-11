# Combine data from the different files:

library(tidyverse)

file0 <- read_csv("data_20210208/soc_20210208_0.csv")
file1 <- read_csv("data_20210208/soc_20210208_1.csv")
file2 <- read_csv("data_20210208/soc_20210208_2.csv")
file3 <- read_csv("data_20210208/soc_20210208_3.csv")
file4 <- read_csv("data_20210208/soc_20210208_4.csv")

g12 <- file1 %>% left_join(file2, by = c("International Activity Name","Description"))

g13 <- g12 %>% left_join(file3, by = c("International Activity Name"))

g14 <- g13 %>% left_join(file4, by = c("International Activity Name","Activity Start Date", "Activity End Date"))

g04 <- g14 %>% left_join(file0, by = c("International Activity Name"))


write_csv(g04, "combined_20210208.csv")
