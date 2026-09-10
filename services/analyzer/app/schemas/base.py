"""Every API-facing schema inherits from CamelModel so its JSON shape
matches packages/schemas' camelCase TS types — internal Python code still
uses snake_case field names (`detector_id`), but FastAPI's response
serialization (response_model_by_alias defaults to True) emits
`detectorId`. `populate_by_name` keeps internal round-trips (storing via
field name, reloading via model_validate_json) working either way."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
