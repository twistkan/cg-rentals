import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
metadata = [
    ('Sony FX3', 'Full-frame cinema camera', 'cinema'),
    ('Canon EOS R5 C', 'Mirrorless cinema camera', 'cinema'),
    ('Blackmagic Pocket 6K Pro', 'Battery grip · Canon EF', 'cinema'),
    ('RED RAVEN DRAGON', 'Camera brain / body', 'cinema'),
    ('Blackmagic Pocket 6K Pro', 'V-Mount · Canon EF', 'cinema'),
    ('Kinefinity MAVO 6K', 'Body, rig, batteries & SSD', 'cinema'),
    ('Sony FS7 MKII', 'Body, rig, batteries, lens & memory', 'cinema'),
    ('Blackmagic Pocket 4K', 'Cinema camera', 'cinema'),
    ('Panasonic DVX-200', 'Body, rig, batteries & memory', 'camcorders'),
    ('Blackmagic URSA Mini Pro G2', '4.6K · body, rig, batteries & memory', 'cinema'),
    ('Blackmagic Production Camera 4K', 'Body, rig & memory', 'cinema'),
    ('Canon EOS R', 'Body, EF adapter, batteries & memory', 'mirrorless'),
    ('Canon EOS 6D', 'Body, rig, batteries & memory', 'mirrorless'),
    ('Canon 5D MK IV', 'Body, rig, batteries & memory', 'mirrorless'),
    ('Sony Alpha A7R IV', 'Mirrorless camera', 'mirrorless'),
    ('Sony Alpha A7R III', 'Mirrorless camera', 'mirrorless'),
    ('Sony Alpha A7R II', 'Mirrorless camera', 'mirrorless'),
    ('Sony Alpha A7S II', 'Mirrorless camera', 'mirrorless'),
    ('Sony Alpha A7 III', 'Mirrorless camera', 'mirrorless'),
    ('Fujifilm X-T30', 'Includes 18–55mm lens', 'mirrorless'),
    ('Sony HVR-NX5', 'Professional camcorder', 'camcorders'),
    ('Sony PXW-Z150', '4K XDCAM camcorder', 'camcorders'),
    ('GoPro HERO11 Black', 'Action camera', 'action'),
    ('GoPro HERO10 Black', 'Action camera', 'action'),
    ('GoPro MAX', '360° action camera', 'action'),
    ('EZ JIB', '18 ft camera crane', 'jibs'),
    ('Proaim JIB', '21 ft camera crane', 'jibs'),
    ('Heavy JIB', '6 ft camera crane', 'jibs'),
    ('Heavy Dolly', 'Camera dolly', 'dollies'),
    ('Heavy Slider', '12 ft slider', 'sliders'),
    ('Heavy Slider', '8 ft slider', 'sliders'),
    ('Double Slider for DSLR', 'Slider only', 'sliders'),
    ('Double Slider for DSLR', 'Includes tripod', 'sliders'),
    ('Motorized Slider', '4 ft motorized slider', 'sliders'),
    ('DJI Ronin S', 'Motorized gimbal stabilizer', 'stabilizers'),
    ('Glidecam XR 4000', 'Camera stabilizer', 'stabilizers'),
    ('Zhiyun Crane 3S', 'Motorized gimbal stabilizer', 'stabilizers'),
    ('Zhiyun Crane 3S', 'Wireless monitor & focus zoom control', 'stabilizers'),
]
with (root / 'catalogue.csv').open(newline='') as file:
    source = list(csv.DictReader(file))
assert len(source) == len(metadata) == 38
items = []
for row, (title, description, category) in zip(source, metadata):
    price = int(row['Price'].replace(',', '').replace(' UGX', ''))
    assert 0 < price <= 500000
    items.append(dict(id=int(row['index']), title=title, description=description,
                      category=category, price=price, sourceName=row['Equipment'],
                      sourceCategory=row['Category']))
assert len({i['id'] for i in items}) == 38
assert items[31]['price'] == 50000 and items[32]['price'] == 100000
(root / 'dist/catalogue.json').write_text(json.dumps(items, ensure_ascii=False, indent=2) + '\n')
print('Validated and prepared all 38 catalogue items; UGX prices and variants preserved.')
