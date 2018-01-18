%global debug_package %{nil}

Name: cockpit-app-freeipa
Version: 11
Release: 0
Summary: FreeIPA installer for Cockpit
License: LGPLv2+

Source: cockpit-app-freeipa.tar.gz
BuildArch: noarch

Requires: freeipa-server, cockpit

%description
FreeIPA application for Cockpit eases FreeIPA server deployment
by providing a visual way to construct FreeIPA installer configuration
and initiate installation of FreeIPA master or replica.

%prep
%setup -n cockpit-app-freeipa

%build

%install
make install-only DESTDIR=%{buildroot}
find %{buildroot} -type f >> files.list
sed -i "s|%{buildroot}||" *.list

%files -f files.list
%dir %{_datadir}/cockpit/app-freeipa
%doc README.md

%changelog
* Mon Jan 15 2018 - Alexander Bokovoy <abokovoy@redhat.com> - 11-0
- Initial release
