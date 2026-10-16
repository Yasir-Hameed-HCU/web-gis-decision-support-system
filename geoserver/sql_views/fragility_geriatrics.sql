SELECT fr.grid_id, g.geom,
       fr.fragility_score, fr.fragility_class,
       fr.dependency_gap, fr.redundancy_count,
       g.district_name, g.total_population, g.elderly_population
FROM fragility_results fr
JOIN population_grid g ON fr.grid_id = g.grid_id
WHERE fr.service_group = 'geriatrics'
