SELECT grid_id, geom, travel_time_delta, accessibility_delta,
       population_affected, elderly_affected
FROM v_scenario_diff
WHERE scenario_name LIKE 'Scenario 1:%' AND service_group = 'geriatrics'
