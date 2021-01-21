
-- THIS IS FOR THE SEARCH INDEXES
CREATE EXTENSION pg_trgm

-- THIS IS USED TO AUTO GENERATE GUIDs (tbl_mymaps)
CREATE EXTENSION uuid-ossp


CREATE TABLE public.tbl_app_stats (
	app_name text NULL,
	action_type text NULL,
	action_description text NULL,
	action_date timestamptz NULL,
	id serial NOT NULL,
	CONSTRAINT tbl_app_stats_pkey PRIMARY KEY (id)
);

CREATE TABLE public.tbl_mymaps (
	id uuid NOT NULL DEFAULT uuid_generate_v1(),
	"json" text NULL,
	date_created date NULL,
	CONSTRAINT tbl_mymaps_pk PRIMARY KEY (id)
);

CREATE TABLE public.tbl_map_settings (
	id uuid NOT NULL DEFAULT uuid_generate_v1(),
	"json" text NULL,
	date_created date NULL,
	is_default bool NOT NULL DEFAULT false,
	CONSTRAINT tbl_map_settings_pk PRIMARY KEY (id)
);
--SAMPLE RECORD FOR MAP SETTINGS
--INSERT INTO public.tbl_map_settings (id, "json", date_created, is_default) VALUES(uuid_generate_v1(), '{
--    "name":"Open GIS - Public",
--    "zoom_level": 10,
--    "center": "-8878504.68, 5543492.45",
--    "default_group": "simcoe:All_Layers",
--    "sources":
--    [ 
--      {
--        "layerUrl":"https://opengis.simcoe.ca/geoserver/simcoe/Config_Public_Default/ows?service=wms&version=1.3.0&request=GetCapabilities",
--        "secure": false,
--        "primary":true
--      }
--    ]
--  }', now(), true);


CREATE TABLE public.tbl_os_feedback (
	yminimum float8 NULL,
	ymaximum float8 NULL,
	xminimum float8 NULL,
	xmaximum float8 NULL,
	"scale" float8 NULL,
	rating float8 NULL,
	for_business_use int4 NULL,
	email text NULL,
	"comments" text NULL,
	centery float8 NULL,
	centerx float8 NULL,
	date_created date NULL,
	id uuid NULL DEFAULT uuid_generate_v1(),
	other_uses text NULL,
	education bool NULL,
	recreation bool NULL,
	real_estate bool NULL,
	business bool NULL,
	delivery bool NULL,
	economic_development bool NULL,
	report_problem bool NULL,
	my_maps_id varchar(50) NULL,
	feature_id varchar(50) NULL
);

CREATE TABLE public.tbl_search (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	"name" text NOT NULL,
	alias text NULL,
	"type" text NULL,
	municipality text NULL,
	type_id varchar NOT NULL,
	geojson text NULL,
	geojson_extent varchar NULL,
	location_id text NULL,
	priority int4 NULL,
	geojson_point varchar NULL,
	CONSTRAINT tbl_search_pk PRIMARY KEY (id)
);
CREATE INDEX tbl_search_trgm_idx_alias ON public.tbl_search USING gin (name gin_trgm_ops);
CREATE INDEX tbl_search_trgm_idx_name ON public.tbl_search USING gin (name gin_trgm_ops);
CREATE INDEX tbl_search_trgm_idx_priority ON public.tbl_search USING gin (name gin_trgm_ops);


CREATE TABLE public.tbl_search_layers (
	id serial NOT NULL,
	"type" varchar NULL,
	type_id varchar NULL,
	field_name varchar NULL,
	field_name_alias varchar NULL,
	muni_field_name varchar NULL,
	roll_number_field varchar NULL,
	run_schedule varchar NULL,
	priority varchar NULL,
	last_run varchar NULL,
	last_run_minutes float4 NULL,
	wfs_url text NOT NULL,
	CONSTRAINT tbl_search_layers_pkey PRIMARY KEY (id)
);

-- SAMPLE RECORDS FOR THE SEARCH
-- INSERT INTO public.tbl_search_layers ("type",type_id,field_name,field_name_alias,muni_field_name,roll_number_field,run_schedule,priority,last_run,last_run_minutes,wfs_url) VALUES 
-- ('Airport','sc_airport','name',NULL,'muni',NULL,'ALWAYS','10','2019-09-25 08:41:59.844',0.009483334,'https://opengis.simcoe.ca/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=simcoe:Airport&outputFormat=application/json')
-- ,('Police Station','sc_policestation','Name',NULL,'Municipality',NULL,'ALWAYS','5','2019-09-25 08:42:00.268',0.0069333334,'https://opengis.simcoe.ca/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=simcoe:Police_Station&outputFormat=application/json')
-- ,('Museum And Archives','sc_museumandarchives','Name',NULL,'Municipality',NULL,'ALWAYS','5','2019-09-25 08:42:00.55',0.00465,'https://opengis.simcoe.ca/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=simcoe:Museum_and_Archives&outputFormat=application/json')
-- ,('Hospital','sc_hospital','Name',NULL,'Municipality',NULL,'ALWAYS','5','2019-09-25 08:58:45.324',0.011983333,'https://opengis.simcoe.ca/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=simcoe:Hospital&outputFormat=application/json')
-- ;

