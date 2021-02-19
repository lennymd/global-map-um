library(tidyverse)


# Load all data

base <- read_csv("data_20210208/base.csv")
activity_status <- read_csv("data_20210208/active_status.csv")
country_info <- read_csv("data_20210208/country.csv")


new_base <- base %>%
  left_join(activity_status, by="International Activity Name")

new_base_plus_country <- new_base %>%
  left_join(country_info, by=c("International Activity Name", "Description", "Activity Type"))


write_csv(new_base_plus_country, "data/activities_by_country_20210208.csv")
