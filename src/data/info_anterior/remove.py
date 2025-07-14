import pandas as pd

df = pd.read_csv("src/data/nova_base_atualizada.csv", sep=";", encoding="utf-8")

df = df.drop('valor_curso', axis=1)

df.to_csv("src/data/nova_base_atualizada_sem.csv", sep=";", index=False, encoding="utf-8")
