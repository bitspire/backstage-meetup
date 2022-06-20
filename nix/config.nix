{ jdk ? "jdk11" }:

{
  packageOverrides = p: {
    sbt = p.sbt.override {
      jre = p.${jdk};
    };
    flyway = p.flyway.override {
      jre_headless = p.${jdk};
    };
  };
}

